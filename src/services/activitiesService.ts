// ==============================================================================
// BrightPath CRM — Activities Service
// Immutable audit logging and chronological enquiry timeline
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { ActivityWithActor, CreateActivityInput, Activity } from '../types/database';

export const activitiesService = {
  /**
   * Retrieves chronological audit activities for a specific student lead
   */
  async getActivitiesForLead(leadId: string): Promise<ActivityWithActor[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        actor:profiles!activities_actor_id_fkey(id, full_name, role)
      `)
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching activities for lead:', error.message);
      throw error;
    }

    return (data || []) as unknown as ActivityWithActor[];
  },

  /**
   * Logs a manual interaction activity (Phone Call, Discussion Note, WhatsApp, Walk-in)
   */
  async logActivity(input: CreateActivityInput, actorId?: string): Promise<Activity> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const payload = {
      lead_id: input.lead_id,
      actor_id: actorId || null,
      activity_type: input.activity_type,
      description: input.description.trim(),
      metadata: input.metadata || {},
    };

    const { data, error } = await supabase
      .from('activities')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error logging activity event:', error.message);
      throw error;
    }

    return data as unknown as Activity;
  },

  /**
   * Retrieves the most recent system-wide activity events
   */
  async getRecentActivities(limit = 10): Promise<ActivityWithActor[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        actor:profiles!activities_actor_id_fkey(id, full_name, role)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent activities:', error.message);
      return [];
    }

    return (data || []) as unknown as ActivityWithActor[];
  },
};
