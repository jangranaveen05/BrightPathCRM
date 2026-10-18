-- ==============================================================================
-- BrightPath CRM — Migration 002: Seed Data (Realistic Coaching Institute Leads)
-- Target: PostgreSQL / Supabase
-- Description:
--   Populates fictional realistic enquiries, follow-ups, and activity records
--   for BrightPath Academy. Can be executed before or after staff accounts exist.
-- ==============================================================================

DO $$
DECLARE
  v_lead1_id UUID := gen_random_uuid();
  v_lead2_id UUID := gen_random_uuid();
  v_lead3_id UUID := gen_random_uuid();
  v_lead4_id UUID := gen_random_uuid();
  v_lead5_id UUID := gen_random_uuid();
  v_lead6_id UUID := gen_random_uuid();
  v_lead7_id UUID := gen_random_uuid();
  v_lead8_id UUID := gen_random_uuid();
  v_lead9_id UUID := gen_random_uuid();
  v_lead10_id UUID := gen_random_uuid();
  v_lead11_id UUID := gen_random_uuid();
  v_lead12_id UUID := gen_random_uuid();
  
  -- Pick any existing staff profile if one exists, or NULL if fresh DB
  v_staff_id UUID := (SELECT id FROM public.profiles LIMIT 1);
BEGIN

  -- 1. INSERT REALISTIC LEADS
  INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, lost_reason, assigned_to, created_by, notes, created_at)
  VALUES
    (
      v_lead1_id,
      'Aarav Sharma',
      'aarav.sharma@example.com',
      '+91 98201 11223',
      'NEET Dropper 2026 Batch',
      'Website',
      'Contacted',
      NULL,
      v_staff_id,
      v_staff_id,
      'Scored 510 in previous attempt. Looking for intensive test series and doubt-solving batches.',
      NOW() - INTERVAL '3 days'
    ),
    (
      v_lead2_id,
      'Priya Patel',
      'priya.patel@example.com',
      '+91 98765 43210',
      'JEE Advanced Sprint',
      'Walk-in',
      'Qualified',
      NULL,
      v_staff_id,
      v_staff_id,
      'Top student from KV. Parents visited branch for fee structure and faculty credentials.',
      NOW() - INTERVAL '5 days'
    ),
    (
      v_lead3_id,
      'Rohan Verma',
      'rohan.verma@example.com',
      '+91 98112 34567',
      'Foundation Class 10th (NTSE/Olympiad)',
      'Referral',
      'New',
      NULL,
      v_staff_id,
      v_staff_id,
      'Referred by current student Ankit Verma. Needs weekend batch details.',
      NOW() - INTERVAL '1 day'
    ),
    (
      v_lead4_id,
      'Ananya Iyer',
      'ananya.iyer@example.com',
      '+91 99203 44556',
      'NEET 2-Year Integrated Program',
      'Social Media',
      'Converted',
      NULL,
      v_staff_id,
      v_staff_id,
      'Completed registration and paid initial admission token. Enrolled in Batch B1.',
      NOW() - INTERVAL '12 days'
    ),
    (
      v_lead5_id,
      'Kabir Singh',
      'kabir.singh@example.com',
      '+91 98450 67890',
      'JEE 2-Year Program',
      'Call',
      'Lost',
      'Joined competitor institute due to batch timing conflict with school',
      v_staff_id,
      v_staff_id,
      'Needed morning 7 AM batch which was already full. Requested evening but parents refused commute.',
      NOW() - INTERVAL '15 days'
    ),
    (
      v_lead6_id,
      'Diya Gupta',
      'diya.gupta@example.com',
      '+91 98334 55667',
      'Class 12th Board Booster + CUET',
      'Website',
      'Contacted',
      NULL,
      v_staff_id,
      v_staff_id,
      'Submitted inquiry form requesting syllabus timeline and scholarship exam date.',
      NOW() - INTERVAL '2 days'
    ),
    (
      v_lead7_id,
      'Aditya Deshmukh',
      'aditya.deshmukh@example.com',
      '+91 97654 32109',
      'UPSC Prelims Comprehensive 2026',
      'Referral',
      'Qualified',
      NULL,
      v_staff_id,
      v_staff_id,
      'Working professional. Inquired about weekend batch + recorded lecture access.',
      NOW() - INTERVAL '6 days'
    ),
    (
      v_lead8_id,
      'Sneha Kulkarni',
      'sneha.k@example.com',
      '+91 98901 23456',
      'NEET Crash Course 2026',
      'Walk-in',
      'Converted',
      NULL,
      v_staff_id,
      v_staff_id,
      'Confirmed admission after attending Sunday demo session by Dr. Sengupta.',
      NOW() - INTERVAL '8 days'
    ),
    (
      v_lead9_id,
      'Vikram Malhotra',
      'vikram.m@example.com',
      '+91 97110 98765',
      'JEE Main Revision FastTrack',
      'Other',
      'Lost',
      'Fee structure exceeded family budget; offered scholarship test but declined',
      v_staff_id,
      v_staff_id,
      'Requested 50% flat discount. Not eligible under current financial aid guidelines.',
      NOW() - INTERVAL '20 days'
    ),
    (
      v_lead10_id,
      'Meera Nair',
      'meera.nair@example.com',
      '+91 98401 56789',
      'Class 9th Foundation Science & Math',
      'Website',
      'New',
      NULL,
      v_staff_id,
      v_staff_id,
      'Parent enquiry through website chat widget. Needs diagnostic test link.',
      NOW() - INTERVAL '4 hours'
    ),
    (
      v_lead11_id,
      'Karan Johar',
      'karan.j@example.com',
      '+91 98220 33445',
      'CUET Commerce & Humanities Sprint',
      'Call',
      'Contacted',
      NULL,
      v_staff_id,
      v_staff_id,
      'Inquired regarding mock test platform and domain subjects available.',
      NOW() - INTERVAL '4 days'
    ),
    (
      v_lead12_id,
      'Tanvi Joshi',
      'tanvi.joshi@example.com',
      '+91 98199 88776',
      'NEET 2027 Long-term',
      'Social Media',
      'Qualified',
      NULL,
      v_staff_id,
      v_staff_id,
      'Attended Instagram live webinar. Scheduled one-on-one academic counselling session.',
      NOW() - INTERVAL '7 days'
    );

  -- 2. INSERT FOLLOW-UPS (Mix of Overdue, Today, Upcoming, and Completed)
  INSERT INTO public.follow_ups (lead_id, assigned_to, due_at, note, status, completed_at, created_by, created_at)
  VALUES
    -- OVERDUE Task (Due 2 days ago)
    (
      v_lead1_id,
      v_staff_id,
      NOW() - INTERVAL '2 days',
      'Share NEET Dropper test schedule PDF and check if demo class can be scheduled.',
      'pending',
      NULL,
      v_staff_id,
      NOW() - INTERVAL '3 days'
    ),
    -- TODAY Task (Due in 3 hours)
    (
      v_lead2_id,
      v_staff_id,
      NOW() + INTERVAL '3 hours',
      'Call parent regarding scholarship exam registration before Friday batch closing.',
      'pending',
      NULL,
      v_staff_id,
      NOW() - INTERVAL '1 day'
    ),
    -- UPCOMING Task (Due in 2 days)
    (
      v_lead3_id,
      v_staff_id,
      NOW() + INTERVAL '2 days',
      'Send Foundation Class 10 brochure on WhatsApp and follow up after dinner time.',
      'pending',
      NULL,
      v_staff_id,
      NOW() - INTERVAL '1 day'
    ),
    -- UPCOMING Task (Due in 4 days)
    (
      v_lead7_id,
      v_staff_id,
      NOW() + INTERVAL '4 days',
      'Follow up on weekend batch demo video link sent via email.',
      'pending',
      NULL,
      v_staff_id,
      NOW() - INTERVAL '2 days'
    ),
    -- COMPLETED Task
    (
      v_lead4_id,
      v_staff_id,
      NOW() - INTERVAL '5 days',
      'Verify admission fee transfer receipt and issue student ID card.',
      'completed',
      NOW() - INTERVAL '4 days',
      v_staff_id,
      NOW() - INTERVAL '6 days'
    ),
    -- COMPLETED Task
    (
      v_lead8_id,
      v_staff_id,
      NOW() - INTERVAL '7 days',
      'Send welcome kit and batch orientation invite for Crash Course.',
      'completed',
      NOW() - INTERVAL '7 days',
      v_staff_id,
      NOW() - INTERVAL '8 days'
    );

  -- 3. INSERT TIMELINE ACTIVITIES (Audit Events)
  INSERT INTO public.activities (lead_id, actor_id, activity_type, description, metadata, created_at)
  VALUES
    (
      v_lead1_id,
      v_staff_id,
      'LEAD_CREATED',
      'New enquiry received via Website for NEET Dropper 2026 Batch',
      '{"source": "Website", "course": "NEET Dropper 2026 Batch"}'::jsonb,
      NOW() - INTERVAL '3 days'
    ),
    (
      v_lead1_id,
      v_staff_id,
      'PHONE_CALL',
      'Initial counselling phone call conducted. Discussed test series schedule.',
      '{"duration_minutes": 8, "outcome": "positive"}'::jsonb,
      NOW() - INTERVAL '2 days'
    ),
    (
      v_lead2_id,
      v_staff_id,
      'WALK_IN_VISIT',
      'Student and parent visited center. Evaluated JEE Advanced study material.',
      '{"center": "Main Campus", "counsellor_notes": "Very keen"}'::jsonb,
      NOW() - INTERVAL '5 days'
    ),
    (
      v_lead2_id,
      v_staff_id,
      'STATUS_CHANGED',
      'Lead status changed from New to Qualified',
      '{"from": "New", "to": "Qualified"}'::jsonb,
      NOW() - INTERVAL '3 days'
    ),
    (
      v_lead4_id,
      v_staff_id,
      'STATUS_CHANGED',
      'Lead converted to enrolled student. Admission ID: BP-2026-084',
      '{"from": "Qualified", "to": "Converted", "batch": "B1"}'::jsonb,
      NOW() - INTERVAL '10 days'
    ),
    (
      v_lead5_id,
      v_staff_id,
      'STATUS_CHANGED',
      'Lead marked as Lost. Reason: Joined competitor institute due to batch timing conflict',
      '{"from": "Contacted", "to": "Lost", "reason": "Batch timing conflict"}'::jsonb,
      NOW() - INTERVAL '15 days'
    );

END $$;
