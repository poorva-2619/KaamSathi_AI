-- ==============================================================================
-- KaamSathi AI: Row Level Security (RLS) Policies (Spec §32)
-- Migration 02: Enable RLS & Security Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. Profiles Policies
-- ------------------------------------------------------------------------------

-- Anyone authenticated can view user profiles
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 2. Jobs Policies
-- ------------------------------------------------------------------------------

-- Anyone authenticated can view open jobs, providers can see their own, accepted workers can see assigned jobs
CREATE POLICY "Jobs are viewable by authenticated users"
ON public.jobs
FOR SELECT
TO authenticated
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

-- Providers can create jobs
CREATE POLICY "Providers can create jobs"
ON public.jobs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = provider_id);

-- Providers can update their own jobs
CREATE POLICY "Providers can update their own jobs"
ON public.jobs
FOR UPDATE
TO authenticated
USING (auth.uid() = provider_id)
WITH CHECK (auth.uid() = provider_id);

-- Providers can delete their own jobs
CREATE POLICY "Providers can delete their own jobs"
ON public.jobs
FOR DELETE
TO authenticated
USING (auth.uid() = provider_id);

-- ------------------------------------------------------------------------------
-- 3. Applications Policies
-- ------------------------------------------------------------------------------

-- Workers can view their applications, and providers can view applications to their jobs
CREATE POLICY "Applications viewable by worker and job provider"
ON public.applications
FOR SELECT
TO authenticated
USING (
    worker_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.jobs
        WHERE jobs.id = applications.job_id
        AND jobs.provider_id = auth.uid()
    )
);

-- Workers can create applications
CREATE POLICY "Workers can apply to jobs"
ON public.applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = worker_id);

-- Providers can update application status (accept/reject), workers can withdraw
CREATE POLICY "Providers or workers can update application"
ON public.applications
FOR UPDATE
TO authenticated
USING (
    worker_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.jobs
        WHERE jobs.id = applications.job_id
        AND jobs.provider_id = auth.uid()
    )
);

-- ------------------------------------------------------------------------------
-- 4. Notifications Policies
-- ------------------------------------------------------------------------------

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can mark their notifications as read
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Authenticated users or database triggers can insert notifications
CREATE POLICY "Authenticated users can trigger notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 5. Messages Policies
-- ------------------------------------------------------------------------------

-- Users can view messages they sent or received
CREATE POLICY "Users can view their own conversations"
ON public.messages
FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages
CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);
