// ==============================================================================
// BrightPath CRM — Leads Service
// Comprehensive CRUD, Filtering, Search, and Audit Logging for Leads
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type {
  Lead,
  LeadWithAssignee,
  CreateLeadInput,
  UpdateLeadInput,
  LeadStatus,
  LeadSource,
  Profile,
} from '../types/database';

export interface LeadFilterParams {
  search?: string;
  status?: LeadStatus | 'ALL';
  source?: LeadSource | 'ALL';
  assignedTo?: string | 'ALL' | 'UNASSIGNED';
}

export const leadsService = {
  /**
   * Retrieves all accessible leads with assigned counsellor profiles
   */
  async getLeads(filters?: LeadFilterParams): Promise<LeadWithAssignee[]> {
    if (!isSupabaseConfigured) return [];

    let query = supabase
      .from('leads')
      .select(`
        *,
        assignee:profiles!leads_assigned_to_fkey(id, full_name, role),
        creator:profiles!leads_created_by_fkey(id, full_name)
      `)
      .order('created_at', { ascending: false });

    // Apply Status filter
    if (filters?.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status);
    }

    // Apply Source filter
    if (filters?.source && filters.source !== 'ALL') {
      query = query.eq('source', filters.source);
    }

    // Apply Assignee filter
    if (filters?.assignedTo && filters.assignedTo !== 'ALL') {
      if (filters.assignedTo === 'UNASSIGNED') {
        query = query.is('assigned_to', null);
      } else {
        query = query.eq('assigned_to', filters.assignedTo);
      }
    }

    // Apply text search across name, phone, email, and course interest
    if (filters?.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      query = query.or(`full_name.ilike.${term},phone.ilike.${term},email.ilike.${term},course_interest.ilike.${term}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching leads:', error.message);
      throw error;
    }

    return (data || []) as unknown as LeadWithAssignee[];
  },

  /**
   * Retrieves a single lead by its unique ID
   */
  async getLeadById(id: string): Promise<LeadWithAssignee | null> {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        assignee:profiles!leads_assigned_to_fkey(id, full_name, role),
        creator:profiles!leads_created_by_fkey(id, full_name)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching lead by ID:', error.message);
      throw error;
    }

    return (data as unknown as LeadWithAssignee) || null;
  },

  /**
   * Creates a new enquiry lead and records an audit activity log
   */
  async createLead(input: CreateLeadInput, actorId?: string): Promise<Lead> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const leadPayload = {
      full_name: input.full_name.trim(),
      email: input.email ? input.email.trim() : null,
      phone: input.phone.trim(),
      course_interest: input.course_interest.trim(),
      source: input.source,
      status: input.status || 'New',
      assigned_to: input.assigned_to || null,
      created_by: actorId || null,
      notes: input.notes ? input.notes.trim() : null,
    };

    const { data, error } = await supabase
      .from('leads')
      .insert(leadPayload)
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error.message);
      throw error;
    }

    const createdLead = data as unknown as Lead;

    // Automatically record activity event
    if (createdLead) {
      try {
        await supabase.from('activities').insert({
          lead_id: createdLead.id,
          actor_id: actorId || null,
          activity_type: 'LEAD_CREATED',
          description: `Enquiry captured for ${createdLead.course_interest} via ${createdLead.source}`,
          metadata: { source: createdLead.source, course: createdLead.course_interest },
        });
      } catch (actErr) {
        console.warn('Non-fatal: Failed to log lead creation activity', actErr);
      }
    }

    return createdLead;
  },

  /**
   * Updates an existing lead with optional status change activity logging
   */
  async updateLead(
    id: string,
    input: UpdateLeadInput,
    actorId?: string,
    currentStatus?: LeadStatus
  ): Promise<Lead> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const updatePayload: import('../types/database').Database['public']['Tables']['leads']['Update'] = {};

    if (input.full_name !== undefined) updatePayload.full_name = input.full_name.trim();
    if (input.email !== undefined) updatePayload.email = input.email ? input.email.trim() : null;
    if (input.phone !== undefined) updatePayload.phone = input.phone.trim();
    if (input.course_interest !== undefined) updatePayload.course_interest = input.course_interest.trim();
    if (input.source !== undefined) updatePayload.source = input.source;
    if (input.status !== undefined) updatePayload.status = input.status;
    if (input.lost_reason !== undefined) updatePayload.lost_reason = input.lost_reason;
    if (input.assigned_to !== undefined) updatePayload.assigned_to = input.assigned_to;
    if (input.notes !== undefined) updatePayload.notes = input.notes ? input.notes.trim() : null;

    const { data, error } = await supabase
      .from('leads')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead:', error.message);
      throw error;
    }

    // If status transitioned, log status change activity
    if (input.status && currentStatus && input.status !== currentStatus) {
      try {
        const desc = input.status === 'Lost' && input.lost_reason
          ? `Status changed from ${currentStatus} to Lost. Reason: ${input.lost_reason}`
          : `Status changed from ${currentStatus} to ${input.status}`;

        await supabase.from('activities').insert({
          lead_id: id,
          actor_id: actorId || null,
          activity_type: 'STATUS_CHANGED',
          description: desc,
          metadata: { from: currentStatus, to: input.status, reason: input.lost_reason || null },
        });
      } catch (actErr) {
        console.warn('Non-fatal: Failed to log status change activity', actErr);
      }
    }

    return data as Lead;
  },

  /**
   * Deletes a lead (only allowed for Admin / Manager via RLS)
   */
  async deleteLead(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) {
      console.error('Error deleting lead:', error.message);
      throw error;
    }
  },

  /**
   * Fetches all registered staff profiles for assignment dropdowns
   */
  async getStaffProfiles(): Promise<Profile[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching staff profiles:', error.message);
      return [];
    }

    return (data || []) as Profile[];
  },
};
