-- ==============================================================================
-- BrightPath CRM — Migration 001: Initial Schema, Indexes & Row Level Security
-- Target: PostgreSQL / Supabase
-- Description:
--   Creates profiles, leads, follow_ups, and activities tables with strict
--   constraints, foreign keys, triggers, security functions, and RLS policies.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. HELPER FUNCTIONS & TRIGGERS

-- 2.1 Function to update 'updated_at' timestamp automatically
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TABLES DEFINITION

-- 3.1 PROFILES TABLE
-- Extends Supabase auth.users with CRM-specific profile and role information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'counsellor' CHECK (role IN ('admin', 'manager', 'counsellor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles updated_at trigger
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3.2 LEADS TABLE
-- Central enquiry and admission pipeline table for BrightPath Academy
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  course_interest TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('Website', 'Walk-in', 'Referral', 'Call', 'Social Media', 'Other')),
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')),
  lost_reason TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_lost_reason CHECK (
    (status = 'Lost' AND lost_reason IS NOT NULL AND length(trim(lost_reason)) > 0)
    OR (status <> 'Lost')
  )
);

-- Leads updated_at trigger
DROP TRIGGER IF EXISTS set_leads_updated_at ON public.leads;
CREATE TRIGGER set_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3.3 FOLLOW_UPS TABLE
-- Task and follow-up management with dynamic overdue logic
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_at TIMESTAMPTZ NOT NULL,
  note TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4 ACTIVITIES TABLE
-- Chronological audit trail and timeline events
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_leads_status_assigned ON public.leads(status, assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON public.leads(created_by);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_followups_due_status ON public.follow_ups(due_at, status);
CREATE INDEX IF NOT EXISTS idx_followups_lead_id ON public.follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS idx_followups_assigned_to ON public.follow_ups(assigned_to);

CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON public.activities(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_actor_id ON public.activities(actor_id);

-- 5. AUTOMATION FUNCTIONS & TRIGGERS

-- 5.1 Auto-provision public.profiles on new auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  extracted_name TEXT;
BEGIN
  -- Attempt to extract full_name from auth metadata, fallback to email prefix
  extracted_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(extracted_name, 'BrightPath Staff'),
    'counsellor' -- Default role for all self-registered staff
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5.2 Safe function to get current user's role (Prevents RLS Recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 5.3 Helper procedure to promote user to Admin
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(target_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = (SELECT id FROM auth.users WHERE email = target_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5.4 Prevent non-admin users from escalating their own role
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role <> OLD.role AND public.get_current_user_role() NOT IN ('admin') THEN
    RAISE EXCEPTION 'Access denied: Only administrators can modify profile roles.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS check_role_escalation ON public.profiles;
CREATE TRIGGER check_role_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all CRM tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 6.1 PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Authenticated users can read all profiles (required for assignees, team lists, and dropdowns)
CREATE POLICY "profiles_select_authenticated"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Users can update their own profile (name, etc. - role escalation protected by trigger)
CREATE POLICY "profiles_update_self"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can update any profile (change role, reassign)
CREATE POLICY "profiles_update_admin"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

-- ------------------------------------------------------------------------------
-- 6.2 LEADS POLICIES
-- ------------------------------------------------------------------------------
-- Admins and Managers have complete SELECT visibility across all leads
-- Counsellors can only SELECT leads assigned to them or created by them
CREATE POLICY "leads_select_policy"
ON public.leads FOR SELECT
TO authenticated
USING (
  public.get_current_user_role() IN ('admin', 'manager')
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
);

-- Any authenticated staff member can create new leads
CREATE POLICY "leads_insert_policy"
ON public.leads FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Admins & Managers can update any lead
-- Counsellors can update leads assigned to them or created by them
CREATE POLICY "leads_update_policy"
ON public.leads FOR UPDATE
TO authenticated
USING (
  public.get_current_user_role() IN ('admin', 'manager')
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
)
WITH CHECK (
  public.get_current_user_role() IN ('admin', 'manager')
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
);

-- Only Admins and Managers can delete leads (prevents accidental loss)
CREATE POLICY "leads_delete_policy"
ON public.leads FOR DELETE
TO authenticated
USING (
  public.get_current_user_role() IN ('admin', 'manager')
);

-- ------------------------------------------------------------------------------
-- 6.3 FOLLOW_UPS POLICIES
-- ------------------------------------------------------------------------------
-- Admins & Managers can view all follow-ups
-- Counsellors can view follow-ups assigned to them or attached to leads they can view
CREATE POLICY "followups_select_policy"
ON public.follow_ups FOR SELECT
TO authenticated
USING (
  public.get_current_user_role() IN ('admin', 'manager')
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = follow_ups.lead_id
      AND (l.assigned_to = auth.uid() OR l.created_by = auth.uid())
  )
);

-- Authenticated staff can insert follow-ups
CREATE POLICY "followups_insert_policy"
ON public.follow_ups FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Counsellors can update their assigned follow-ups or follow-ups on their leads;
-- Admins and Managers have full update permissions
CREATE POLICY "followups_update_policy"
ON public.follow_ups FOR UPDATE
TO authenticated
USING (
  public.get_current_user_role() IN ('admin', 'manager')
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = follow_ups.lead_id
      AND (l.assigned_to = auth.uid() OR l.created_by = auth.uid())
  )
)
WITH CHECK (
  public.get_current_user_role() IN ('admin', 'manager')
  OR assigned_to = auth.uid()
  OR created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = follow_ups.lead_id
      AND (l.assigned_to = auth.uid() OR l.created_by = auth.uid())
  )
);

-- Admins and Managers can delete follow-ups
CREATE POLICY "followups_delete_policy"
ON public.follow_ups FOR DELETE
TO authenticated
USING (
  public.get_current_user_role() IN ('admin', 'manager')
);

-- ------------------------------------------------------------------------------
-- 6.4 ACTIVITIES POLICIES (Immutable Audit Log)
-- ------------------------------------------------------------------------------
-- Visibility mirrors lead accessibility
CREATE POLICY "activities_select_policy"
ON public.activities FOR SELECT
TO authenticated
USING (
  public.get_current_user_role() IN ('admin', 'manager')
  OR EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = activities.lead_id
      AND (l.assigned_to = auth.uid() OR l.created_by = auth.uid())
  )
);

-- Any authenticated staff member can log an activity
CREATE POLICY "activities_insert_policy"
ON public.activities FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Immutable audit trail: Updates and Deletions are forbidden for all standard users
-- Only service_role can alter activity history
