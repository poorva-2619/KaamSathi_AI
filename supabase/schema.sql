-- ==============================================================================
-- KaamSathi AI: Complete Consolidated Database Schema & RLS
-- Specs: §31 (Schema), §32 (RLS), §23–§25 / F7 (Atomic Acceptance Locking)
-- Run this script in the Supabase SQL Editor.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLES & RELATIONSHIPS
-- ------------------------------------------------------------------------------

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('job_provider', 'service_provider')),
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    skills TEXT[] DEFAULT '{}'::text[],
    hazards_avoided TEXT[] DEFAULT '{}'::text[],
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    address TEXT,
    max_distance_km NUMERIC DEFAULT 20,
    rating NUMERIC DEFAULT 5.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    wage NUMERIC NOT NULL,
    wage_type TEXT NOT NULL CHECK (wage_type IN ('daily', 'hourly', 'fixed')),
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    address TEXT,
    required_skills TEXT[] DEFAULT '{}'::text[],
    hazards TEXT[] DEFAULT '{}'::text[],
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    cover_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_worker_per_job UNIQUE (job_id, worker_id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('job_application', 'job_accepted', 'job_rejected', 'chat', 'system')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_provider_id ON public.jobs(provider_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_worker_id ON public.applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_job_id ON public.messages(job_id);

-- ------------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Jobs Policies
DROP POLICY IF EXISTS "Jobs are viewable by authenticated users" ON public.jobs;
CREATE POLICY "Jobs are viewable by authenticated users"
ON public.jobs FOR SELECT TO authenticated
USING (
    status = 'open'
    OR provider_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.applications
        WHERE applications.job_id = jobs.id
        AND applications.worker_id = auth.uid()
        AND applications.status = 'accepted'
    )
);

DROP POLICY IF EXISTS "Providers can create jobs" ON public.jobs;
CREATE POLICY "Providers can create jobs"
ON public.jobs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = provider_id);

DROP POLICY IF EXISTS "Providers can update their own jobs" ON public.jobs;
CREATE POLICY "Providers can update their own jobs"
ON public.jobs FOR UPDATE TO authenticated
USING (auth.uid() = provider_id) WITH CHECK (auth.uid() = provider_id);

DROP POLICY IF EXISTS "Providers can delete their own jobs" ON public.jobs;
CREATE POLICY "Providers can delete their own jobs"
ON public.jobs FOR DELETE TO authenticated
USING (auth.uid() = provider_id);

-- Applications Policies
DROP POLICY IF EXISTS "Applications viewable by worker and job provider" ON public.applications;
CREATE POLICY "Applications viewable by worker and job provider"
ON public.applications FOR SELECT TO authenticated
USING (
    worker_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.jobs
        WHERE jobs.id = applications.job_id
        AND jobs.provider_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Workers can apply to jobs" ON public.applications;
CREATE POLICY "Workers can apply to jobs"
ON public.applications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Providers or workers can update application" ON public.applications;
CREATE POLICY "Providers or workers can update application"
ON public.applications FOR UPDATE TO authenticated
USING (
    worker_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.jobs
        WHERE jobs.id = applications.job_id
        AND jobs.provider_id = auth.uid()
    )
);

-- Notifications Policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can trigger notifications" ON public.notifications;
CREATE POLICY "Authenticated users can trigger notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (true);

-- Messages Policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.messages;
CREATE POLICY "Users can view their own conversations"
ON public.messages FOR SELECT TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- ------------------------------------------------------------------------------
-- 3. ATOMIC LOCKING & TRANSACTIONS (F1 / F7)
-- ------------------------------------------------------------------------------

-- Unique partial index: exactly one accepted application per job
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_accepted_application_per_job
ON public.applications (job_id)
WHERE (status = 'accepted');

-- Atomic job acceptance RPC with row-level locking
CREATE OR REPLACE FUNCTION public.accept_job_application(
    p_application_id UUID,
    p_job_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_job_status TEXT;
    v_provider_id UUID;
    v_worker_id UUID;
    v_job_title TEXT;
BEGIN
    -- 1. Row-level lock on the job row
    SELECT provider_id, status, title 
    INTO v_provider_id, v_job_status, v_job_title
    FROM public.jobs
    WHERE id = p_job_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Job not found');
    END IF;

    -- 2. Verify caller is provider
    IF v_provider_id != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: You are not the provider of this job');
    END IF;

    -- 3. Verify job is still open
    IF v_job_status != 'open' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Job is already assigned or closed');
    END IF;

    -- 4. Lock application row
    SELECT worker_id INTO v_worker_id
    FROM public.applications
    WHERE id = p_application_id AND job_id = p_job_id AND status = 'pending'
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Application is not valid or no longer pending');
    END IF;

    -- 5. Mark application as accepted
    UPDATE public.applications
    SET status = 'accepted', updated_at = now()
    WHERE id = p_application_id;

    -- 6. Reject all remaining applications for this job
    UPDATE public.applications
    SET status = 'rejected', updated_at = now()
    WHERE job_id = p_job_id AND id != p_application_id AND status = 'pending';

    -- 7. Lock job as assigned
    UPDATE public.jobs
    SET status = 'assigned', updated_at = now()
    WHERE id = p_job_id;

    -- 8. Emit notification for the accepted worker
    INSERT INTO public.notifications (user_id, title, message, type, metadata)
    VALUES (
        v_worker_id,
        'Application Accepted! 🎉',
        'Your application for "' || v_job_title || '" has been accepted.',
        'job_accepted',
        jsonb_build_object('job_id', p_job_id, 'application_id', p_application_id)
    );

    RETURN jsonb_build_object(
        'success', true,
        'job_id', p_job_id,
        'application_id', p_application_id,
        'worker_id', v_worker_id
    );
END;
$$;

-- 4. Automatic profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE(new.raw_user_meta_data->>'role', 'service_provider')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
