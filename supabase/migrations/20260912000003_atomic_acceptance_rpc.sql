-- ==============================================================================
-- KaamSathi AI: Atomic Job Acceptance & Concurrency Protection (F1 / F7)
-- Migration 03: Partial Index, Atomic RPC Function & Triggers
-- ==============================================================================

-- 1. Unique Partial Index: Exactly 1 accepted application per job
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_accepted_application_per_job
ON public.applications (job_id)
WHERE (status = 'accepted');

-- 2. Atomic Job Acceptance RPC Function
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
    -- Step 1: Acquire row-level lock on the job row to prevent concurrent acceptances
    SELECT provider_id, status, title 
    INTO v_provider_id, v_job_status, v_job_title
    FROM public.jobs
    WHERE id = p_job_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Job not found');
    END IF;

    -- Step 2: Ensure caller is the owner/provider of the job
    IF v_provider_id != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: You are not the provider of this job');
    END IF;

    -- Step 3: Check that job is still open
    IF v_job_status != 'open' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Job is already assigned or closed');
    END IF;

    -- Step 4: Lock and verify the target application
    SELECT worker_id INTO v_worker_id
    FROM public.applications
    WHERE id = p_application_id AND job_id = p_job_id AND status = 'pending'
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Application is not valid or no longer pending');
    END IF;

    -- Step 5: Atomically mark application as accepted
    UPDATE public.applications
    SET status = 'accepted', updated_at = now()
    WHERE id = p_application_id;

    -- Step 6: Automatically reject all remaining pending applications for this job
    UPDATE public.applications
    SET status = 'rejected', updated_at = now()
    WHERE job_id = p_job_id AND id != p_application_id AND status = 'pending';

    -- Step 7: Transition job status to 'assigned'
    UPDATE public.jobs
    SET status = 'assigned', updated_at = now()
    WHERE id = p_job_id;

    -- Step 8: Create instant notification for the accepted worker
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

-- 3. Automatic Profile Creation on auth.users Sign Up
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
