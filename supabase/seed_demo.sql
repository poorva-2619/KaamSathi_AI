-- ==============================================================================
-- KaamSathi AI: Demo Seed Data (F10 — Phase 1)
-- Run this manually in your Supabase SQL editor (Dashboard > SQL Editor)
-- This script is IDEMPOTENT — safe to re-run. It uses a DO block so no
-- real auth.users are created (those need to be created via Auth UI/API).
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → Authentication → Users → Add User
--    Create: demo.provider@kaamsathi.app / Demo@1234
--    Create: sita.worker@kaamsathi.app  / Demo@1234
-- 2. Copy the UUIDs of those two users.
-- 3. Replace PROVIDER_UUID and WORKER_UUID below with the real UUIDs.
-- 4. Paste and run this entire script in Dashboard → SQL Editor.
-- ==============================================================================

DO $$
DECLARE
  v_provider_id UUID := '00000000-0000-0000-0000-000000000001'; -- REPLACE with real provider UUID
  v_worker_id   UUID := '00000000-0000-0000-0000-000000000002'; -- REPLACE with real worker UUID

  -- Malviya Nagar, New Delhi (lat/lng used in F5 lookup table)
  v_lat_mn  DOUBLE PRECISION := 28.5355;
  v_lng_mn  DOUBLE PRECISION := 77.2090;

  -- Saket, New Delhi (nearby, for realistic distance variation)
  v_lat_sk  DOUBLE PRECISION := 28.5244;
  v_lng_sk  DOUBLE PRECISION := 77.2167;

  j1 UUID; j2 UUID; j3 UUID; j4 UUID; j5 UUID;
BEGIN

  -- ─── Profiles ────────────────────────────────────────────────────────────────

  INSERT INTO public.profiles (id, role, full_name, phone, bio, skills, hazards_avoided, lat, lng, address, max_distance_km)
  VALUES (
    v_provider_id, 'job_provider', 'Rajesh Sharma (Demo)', '+91-9800000001',
    'Demo job provider account for KaamSathi AI.',
    '{}', '{}', v_lat_mn, v_lng_mn, 'Malviya Nagar, New Delhi', 20
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role      = EXCLUDED.role;

  INSERT INTO public.profiles (id, role, full_name, phone, bio, skills, hazards_avoided, lat, lng, address, max_distance_km)
  VALUES (
    v_worker_id, 'service_provider', 'Sita Devi (Demo)', '+91-9800000002',
    'Demo service provider (Sita). Skilled in cleaning. Has breathing issue — avoids dust.',
    ARRAY['cleaning', 'cooking'], ARRAY['dust'], v_lat_mn, v_lng_mn, 'Malviya Nagar, New Delhi', 15
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name       = EXCLUDED.full_name,
    role            = EXCLUDED.role,
    skills          = EXCLUDED.skills,
    hazards_avoided = EXCLUDED.hazards_avoided;

  -- ─── Jobs ─────────────────────────────────────────────────────────────────────

  -- Job 1: House Cleaning (spec §38 exact)
  INSERT INTO public.jobs (id, provider_id, title, description, category, wage, wage_type, lat, lng, address, required_skills, hazards, status)
  VALUES (
    gen_random_uuid(), v_provider_id,
    'House Cleaning',
    'Thorough cleaning of a 3BHK apartment. Includes mopping, dusting, bathroom cleaning. Female applicants preferred.',
    'cleaning', 800, 'daily',
    v_lat_mn, v_lng_mn, 'A-12, Malviya Nagar, New Delhi',
    ARRAY['cleaning'], ARRAY['dust'], 'open'
  )
  RETURNING id INTO j1;

  -- Job 2: Construction Helper (spec §38 exact)
  INSERT INTO public.jobs (id, provider_id, title, description, category, wage, wage_type, lat, lng, address, required_skills, hazards, status)
  VALUES (
    gen_random_uuid(), v_provider_id,
    'Construction Helper',
    'Assist in construction site — carry materials, mix cement, support skilled workers. Full day shift (8 AM - 5 PM).',
    'construction', 1200, 'daily',
    v_lat_sk, v_lng_sk, 'B-7, Saket, New Delhi',
    ARRAY['construction', 'general_labour'], ARRAY['dust', 'heavy_lifting'], 'open'
  )
  RETURNING id INTO j2;

  -- Job 3: Local Delivery Partner (spec §38 exact)
  INSERT INTO public.jobs (id, provider_id, title, description, category, wage, wage_type, lat, lng, address, required_skills, hazards, status)
  VALUES (
    gen_random_uuid(), v_provider_id,
    'Local Delivery Partner',
    'Deliver packages within a 5 km radius using your own vehicle (two-wheeler). Flexible shifts.',
    'delivery', 700, 'daily',
    v_lat_mn + 0.005, v_lng_mn + 0.003, 'C-3, Malviya Nagar Extension, New Delhi',
    ARRAY['delivery'], ARRAY['travel'], 'open'
  )
  RETURNING id INTO j3;

  -- Job 4: Gardening & Landscaping
  INSERT INTO public.jobs (id, provider_id, title, description, category, wage, wage_type, lat, lng, address, required_skills, hazards, status)
  VALUES (
    gen_random_uuid(), v_provider_id,
    'Gardening & Landscaping',
    'Trim hedges, plant saplings, water garden, and maintain a small residential garden. Morning shift only.',
    'gardening', 600, 'daily',
    v_lat_mn - 0.004, v_lng_mn + 0.006, 'D-17, Malviya Nagar, New Delhi',
    ARRAY['gardening'], ARRAY['outdoor', 'sun_exposure'], 'open'
  )
  RETURNING id INTO j4;

  -- Job 5: Home Cook (Tiffin Service)
  INSERT INTO public.jobs (id, provider_id, title, description, category, wage, wage_type, lat, lng, address, required_skills, hazards, status)
  VALUES (
    gen_random_uuid(), v_provider_id,
    'Home Cook — Tiffin Service',
    'Prepare 10 tiffin boxes (veg, North Indian) every morning from 7 AM to 11 AM. Kitchen provided.',
    'cooking', 500, 'daily',
    v_lat_sk + 0.003, v_lng_sk - 0.004, 'E-6, Saket, New Delhi',
    ARRAY['cooking'], ARRAY['heat', 'standing'], 'open'
  )
  RETURNING id INTO j5;

  RAISE NOTICE 'Seed data inserted successfully.';
  RAISE NOTICE 'Provider ID: %', v_provider_id;
  RAISE NOTICE 'Worker (Sita) ID: %', v_worker_id;
  RAISE NOTICE 'Job IDs: %, %, %, %, %', j1, j2, j3, j4, j5;

END $$;
