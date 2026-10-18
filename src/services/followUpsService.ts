// ==============================================================================
// BrightPath CRM — FollowUps Service
// Comprehensive scheduling, overdue evaluation, and lifecycle management
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type {
  FollowUp,
  FollowUpWithLead,
  CreateFollowUpInput,
  FollowUpStatus,
} from '../types/database';

export interface FollowUpFilterParams {
  tab?: 'overdue' | 'today' | 'upcoming' | 'completed' | 'all';
  search?: string;
  leadId?: string;
  assignedTo?: string;
}

export interface FollowUpCounts {
  overdue: number;
  today: number;
  upcoming: number;
  completed: number;
  all: number;
}

export const followUpsService = {
  /**
   * Retrieves follow-ups joined with student lead and assigned counsellor profiles
   */
  async getFollowUps(filters?: FollowUpFilterParams): Promise<FollowUpWithLead[]> {
    if (!isSupabaseConfigured) return [];

    let query = supabase
      .from('follow_ups')
      .select(`
        *,
        lead:leads!follow_ups_lead_id_fkey(id, full_name, phone, course_interest, status),
        assignee:profiles!follow_ups_assigned_to_fkey(id, full_name, role)
      `);

    // Lead-specific filter
    if (filters?.leadId) {
      query = query.eq('lead_id', filters.leadId);
    }

    // Specific staff assignment filter
    if (filters?.assignedTo && filters.assignedTo !== 'ALL') {
      if (filters.assignedTo === 'UNASSIGNED') {
        query = query.is('assigned_to', null);
      } else {
        query = query.eq('assigned_to', filters.assignedTo);
      }
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
    const nowIso = now.toISOString();

    // Tab-based stage filtering
    if (filters?.tab === 'overdue') {
      query = query.eq('status', 'pending').lt('due_at', nowIso).order('due_at', { ascending: true });
    } else if (filters?.tab === 'today') {
      query = query
        .eq('status', 'pending')
        .gte('due_at', startOfToday)
        .lte('due_at', endOfToday)
        .order('due_at', { ascending: true });
    } else if (filters?.tab === 'upcoming') {
      query = query.eq('status', 'pending').gt('due_at', endOfToday).order('due_at', { ascending: true });
    } else if (filters?.tab === 'completed') {
      query = query.eq('status', 'completed').order('completed_at', { ascending: false });
    } else {
      // Default: sort pending first by due date, then others
      query = query.order('due_at', { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching follow-ups:', error.message);
      throw error;
    }

    let results = (data || []) as unknown as FollowUpWithLead[];

    // Client-side text search across student name and follow-up notes
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      results = results.filter((item) => {
        const studentName = item.lead?.full_name?.toLowerCase() || '';
        const phone = item.lead?.phone?.toLowerCase() || '';
        const course = item.lead?.course_interest?.toLowerCase() || '';
        const note = item.note?.toLowerCase() || '';
        return studentName.includes(q) || phone.includes(q) || course.includes(q) || note.includes(q);
      });
    }

    return results;
  },

  /**
   * Calculates live count metrics across all follow-up categories
   */
  async getFollowUpCounts(leadId?: string): Promise<FollowUpCounts> {
    if (!isSupabaseConfigured) {
      return { overdue: 0, today: 0, upcoming: 0, completed: 0, all: 0 };
    }

    let query = supabase.from('follow_ups').select('id, due_at, status');
    if (leadId) {
      query = query.eq('lead_id', leadId);
    }

    const { data, error } = await query;
    if (error || !data) {
      console.error('Error fetching follow-up counts:', error?.message);
      return { overdue: 0, today: 0, upcoming: 0, completed: 0, all: 0 };
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
    const nowTime = now.getTime();

    let overdue = 0;
    let today = 0;
    let upcoming = 0;
    let completed = 0;

    for (const item of data) {
      if (item.status === 'completed') {
        completed++;
      } else if (item.status === 'pending') {
        const dueTime = new Date(item.due_at).getTime();
        if (dueTime < nowTime) {
          overdue++;
        } else if (dueTime >= startOfToday && dueTime <= endOfToday) {
          today++;
        } else if (dueTime > endOfToday) {
          upcoming++;
        }
      }
    }

    return {
      overdue,
      today,
      upcoming,
      completed,
      all: data.length,
    };
  },

  /**
   * Retrieves follow-ups for a specific student lead
   */
  async getFollowUpsForLead(leadId: string): Promise<FollowUpWithLead[]> {
    return this.getFollowUps({ leadId });
  },

  /**
   * Schedules a new follow-up and automatically records an audit timeline activity
   */
  async createFollowUp(input: CreateFollowUpInput, actorId?: string): Promise<FollowUp> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const payload = {
      lead_id: input.lead_id,
      due_at: new Date(input.due_at).toISOString(),
      note: input.note.trim(),
      assigned_to: input.assigned_to ? input.assigned_to : null,
      created_by: actorId || null,
      status: 'pending' as FollowUpStatus,
    };

    const { data, error } = await supabase
      .from('follow_ups')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error creating follow-up:', error.message);
      throw error;
    }

    const createdFollowUp = data as unknown as FollowUp;

    // Automatically record activity event
    if (createdFollowUp) {
      try {
        const formattedDate = new Date(createdFollowUp.due_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        await supabase.from('activities').insert({
          lead_id: createdFollowUp.lead_id,
          actor_id: actorId || null,
          activity_type: 'FOLLOWUP_SCHEDULED',
          description: `Follow-up task scheduled for ${formattedDate}: "${createdFollowUp.note}"`,
          metadata: { follow_up_id: createdFollowUp.id, due_at: createdFollowUp.due_at },
        });
      } catch (actErr) {
        console.warn('Non-fatal: Failed to log follow-up creation activity', actErr);
      }
    }

    return createdFollowUp;
  },

  /**
   * Marks a follow-up as completed and logs the activity event
   */
  async markComplete(id: string, actorId?: string, leadId?: string, note?: string): Promise<FollowUp> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const completedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from('follow_ups')
      .update({
        status: 'completed',
        completed_at: completedAt,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error completing follow-up:', error.message);
      throw error;
    }

    // Automatically record activity event
    const targetLeadId = leadId || (data as unknown as FollowUp)?.lead_id;
    if (targetLeadId) {
      try {
        await supabase.from('activities').insert({
          lead_id: targetLeadId,
          actor_id: actorId || null,
          activity_type: 'FOLLOWUP_COMPLETED',
          description: note
            ? `Follow-up completed: ${note}`
            : `Follow-up task marked completed`,
          metadata: { follow_up_id: id, completed_at: completedAt },
        });
      } catch (actErr) {
        console.warn('Non-fatal: Failed to log follow-up completion activity', actErr);
      }
    }

    return data as unknown as FollowUp;
  },

  /**
   * Cancels a pending follow-up task
   */
  async cancelFollowUp(id: string): Promise<FollowUp> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('follow_ups')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error cancelling follow-up:', error.message);
      throw error;
    }

    return data as unknown as FollowUp;
  },

  /**
   * Deletes a follow-up task (Admin / Manager only via RLS)
   */
  async deleteFollowUp(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase.from('follow_ups').delete().eq('id', id);
    if (error) {
      console.error('Error deleting follow-up:', error.message);
      throw error;
    }
  },
};
