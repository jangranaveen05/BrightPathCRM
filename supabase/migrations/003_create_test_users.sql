-- ==============================================================================
-- BrightPath CRM — Migration 003: Provision Test Users with Password 'Password1!'
-- Target: PostgreSQL / Supabase
-- Execution: Copy and paste this script into your Supabase SQL Editor:
--            https://supabase.com/dashboard/project/alqvtmcfvcsbyoxbxozp/sql/new
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  v_admin_id UUID := gen_random_uuid();
  v_counsellor_id UUID := gen_random_uuid();
  v_encrypted_pwd TEXT := crypt('Password1!', gen_salt('bf'));
BEGIN

  -- ============================================================================
  -- 1. USER 1: Administrator (brightpath.crm.test@gmail.com)
  -- ============================================================================
  IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = 'brightpath.crm.test@gmail.com') THEN
    UPDATE auth.users
    SET encrypted_password = v_encrypted_pwd,
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW()
    WHERE lower(email) = 'brightpath.crm.test@gmail.com';
  ELSE
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'brightpath.crm.test@gmail.com',
      v_encrypted_pwd,
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Test Administrator"}',
      NOW(),
      NOW(),
      'authenticated',
      'authenticated'
    );
  END IF;

  -- Ensure profiles table has admin role
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    (SELECT id FROM auth.users WHERE lower(email) = 'brightpath.crm.test@gmail.com'),
    'Test Administrator',
    'admin'
  )
  ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Test Administrator';


  -- ============================================================================
  -- 2. USER 2: Counsellor (counsellor.test@brightpath.edu)
  -- ============================================================================
  IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = 'counsellor.test@brightpath.edu') THEN
    UPDATE auth.users
    SET encrypted_password = v_encrypted_pwd,
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW()
    WHERE lower(email) = 'counsellor.test@brightpath.edu';
  ELSE
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      v_counsellor_id,
      '00000000-0000-0000-0000-000000000000',
      'counsellor.test@brightpath.edu',
      v_encrypted_pwd,
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Anita Roy (Counsellor)"}',
      NOW(),
      NOW(),
      'authenticated',
      'authenticated'
    );
  END IF;

  -- Ensure profiles table has counsellor role
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    (SELECT id FROM auth.users WHERE lower(email) = 'counsellor.test@brightpath.edu'),
    'Anita Roy (Counsellor)',
    'counsellor'
  )
  ON CONFLICT (id) DO UPDATE SET role = 'counsellor', full_name = 'Anita Roy (Counsellor)';

  -- Assign first 3 leads to this counsellor so their isolated pipeline has active records
  UPDATE public.leads
  SET assigned_to = (SELECT id FROM auth.users WHERE lower(email) = 'counsellor.test@brightpath.edu')
  WHERE id IN (SELECT id FROM public.leads ORDER BY created_at ASC LIMIT 3);

END $$;
