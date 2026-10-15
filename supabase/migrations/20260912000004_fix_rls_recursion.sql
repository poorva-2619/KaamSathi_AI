-- Migration: Fix RLS Infinite Recursion between jobs and applications

-- 1. Create SECURITY DEFINER functions to break RLS recursion

-- Helper to check if user is the job provider without triggering jobs RLS again
CREATE OR REPLACE FUNCTION public.is_job_provider(p_job_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.jobs
        WHERE id = p_job_id AND provider_id = auth.uid()
    );
$$;

-- Helper to check if user has an accepted application without triggering applications RLS again
CREATE OR REPLACE FUNCTION public.has_accepted_application(p_job_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.applications
        WHERE job_id = p_job_id AND worker_id = auth.uid() AND status = 'accepted'
    );
$$;

-- 2. Update jobs SELECT policy
DROP POLICY IF EXISTS "Jobs are viewable by authenticated users" ON public.jobs;
CREATE POLICY "Jobs are viewable by authenticated users"
ON public.jobs FOR SELECT TO authenticated
USING (
    status = 'open'
    OR provider_id = auth.uid()
    OR public.has_accepted_application(id)
);

-- 3. Update applications SELECT and UPDATE policies
DROP POLICY IF EXISTS "Applications viewable by worker and job provider" ON public.applications;
CREATE POLICY "Applications viewable by worker and job provider"
ON public.applications FOR SELECT TO authenticated
USING (
    worker_id = auth.uid()
    OR public.is_job_provider(job_id)
);

DROP POLICY IF EXISTS "Providers or workers can update application" ON public.applications;
CREATE POLICY "Providers or workers can update application"
ON public.applications FOR UPDATE TO authenticated
USING (
    worker_id = auth.uid()
    OR public.is_job_provider(job_id)
);
