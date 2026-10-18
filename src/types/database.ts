// ==============================================================================
// BrightPath CRM — Database & Domain Type Definitions
// Corresponds strictly with PostgreSQL schema in supabase/migrations/001_initial_schema.sql
// ==============================================================================

export type UserRole = 'admin' | 'manager' | 'counsellor';

export type LeadSource =
  | 'Website'
  | 'Walk-in'
  | 'Referral'
  | 'Call'
  | 'Social Media'
  | 'Other';

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Converted'
  | 'Lost';

export type FollowUpStatus = 'pending' | 'completed' | 'cancelled';

export type ActivityType =
  | 'LEAD_CREATED'
  | 'STATUS_CHANGED'
  | 'PHONE_CALL'
  | 'EMAIL_SENT'
  | 'WHATSAPP_MESSAGE'
  | 'WALK_IN_VISIT'
  | 'FOLLOWUP_SCHEDULED'
  | 'FOLLOWUP_COMPLETED'
  | 'NOTE_ADDED';

// ------------------------------------------------------------------------------
// Core Table Models
// ------------------------------------------------------------------------------

export interface Profile {
  id: string; // Foreign key to auth.users.id
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  course_interest: string;
  source: LeadSource;
  status: LeadStatus;
  lost_reason: string | null;
  assigned_to: string | null;
  created_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  assigned_to: string | null;
  due_at: string;
  note: string;
  status: FollowUpStatus;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  lead_id: string;
  actor_id: string | null;
  activity_type: string;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ------------------------------------------------------------------------------
// Joined / Enriched Models for UI Consumption
// ------------------------------------------------------------------------------

export interface LeadWithAssignee extends Lead {
  assignee?: Pick<Profile, 'id' | 'full_name' | 'role'> | null;
  creator?: Pick<Profile, 'id' | 'full_name'> | null;
  next_follow_up?: Pick<FollowUp, 'id' | 'due_at' | 'status'> | null;
}

export interface FollowUpWithLead extends FollowUp {
  lead?: Pick<Lead, 'id' | 'full_name' | 'phone' | 'course_interest' | 'status'>;
  assignee?: Pick<Profile, 'id' | 'full_name'> | null;
}

export interface ActivityWithActor extends Activity {
  actor?: Pick<Profile, 'id' | 'full_name' | 'role'> | null;
}

// ------------------------------------------------------------------------------
// DTOs for Creation & Update Operations
// ------------------------------------------------------------------------------

export interface CreateLeadInput {
  full_name: string;
  email?: string | null;
  phone: string;
  course_interest: string;
  source: LeadSource;
  status?: LeadStatus;
  assigned_to?: string | null;
  notes?: string | null;
}

export interface UpdateLeadInput {
  full_name?: string;
  email?: string | null;
  phone?: string;
  course_interest?: string;
  source?: LeadSource;
  status?: LeadStatus;
  lost_reason?: string | null;
  assigned_to?: string | null;
  notes?: string | null;
}

export interface CreateFollowUpInput {
  lead_id: string;
  due_at: string;
  note: string;
  assigned_to?: string | null;
}

export interface CreateActivityInput {
  lead_id: string;
  activity_type: ActivityType | string;
  description: string;
  metadata?: Record<string, unknown>;
}

// ------------------------------------------------------------------------------
// Supabase Database Mapping Interface
// ------------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: UserRole;
          updated_at?: string;
        };
      };
      leads: {
        Row: Lead;
        Insert: {
          id?: string;
          full_name: string;
          email?: string | null;
          phone: string;
          course_interest: string;
          source: LeadSource;
          status?: LeadStatus;
          lost_reason?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string;
          course_interest?: string;
          source?: LeadSource;
          status?: LeadStatus;
          lost_reason?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      follow_ups: {
        Row: FollowUp;
        Insert: {
          id?: string;
          lead_id: string;
          assigned_to?: string | null;
          due_at: string;
          note: string;
          status?: FollowUpStatus;
          completed_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          assigned_to?: string | null;
          due_at?: string;
          note?: string;
          status?: FollowUpStatus;
          completed_at?: string | null;
          created_by?: string | null;
        };
      };
      activities: {
        Row: Activity;
        Insert: {
          id?: string;
          lead_id: string;
          actor_id?: string | null;
          activity_type: string;
          description: string;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          actor_id?: string | null;
          activity_type?: string;
          description?: string;
          metadata?: Record<string, unknown> | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      promote_user_to_admin: {
        Args: { target_email: string };
        Returns: void;
      };
    };
  };
}

// ------------------------------------------------------------------------------
// Enums & Form Constants for Dropdowns and Validation
// ------------------------------------------------------------------------------

export const LEAD_SOURCES: LeadSource[] = [
  'Website',
  'Walk-in',
  'Referral',
  'Call',
  'Social Media',
  'Other',
];

export const LEAD_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Converted',
  'Lost',
];

export const FOLLOW_UP_STATUSES: FollowUpStatus[] = [
  'pending',
  'completed',
  'cancelled',
];

export const USER_ROLES: UserRole[] = ['admin', 'manager', 'counsellor'];
