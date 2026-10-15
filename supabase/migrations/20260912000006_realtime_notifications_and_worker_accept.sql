-- Notification payloads used by the SPA and Realtime.
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('new_job', 'job_accepted', 'job_application', 'job_rejected', 'chat', 'system'));

CREATE INDEX IF NOT EXISTS idx_notifications_job_id ON public.notifications(job_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;

-- Accepting a job and notifying its provider must happen in one transaction.
CREATE OR REPLACE FUNCTION public.accept_job(
  p_job_id UUID,
  p_worker_id UUID,
  p_cover_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job public.jobs%ROWTYPE;
  v_worker_name TEXT;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_worker_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  UPDATE public.jobs
  SET status = 'assigned', updated_at = now()
  WHERE id = p_job_id AND status = 'open'
  RETURNING * INTO v_job;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'conflict', true);
  END IF;

  SELECT full_name INTO v_worker_name FROM public.profiles WHERE id = p_worker_id;

  INSERT INTO public.applications (job_id, worker_id, status, cover_note)
  VALUES (p_job_id, p_worker_id, 'accepted', p_cover_note)
  ON CONFLICT (job_id, worker_id) DO UPDATE
  SET status = 'accepted', cover_note = EXCLUDED.cover_note, updated_at = now();

  UPDATE public.applications
  SET status = 'rejected', updated_at = now()
  WHERE job_id = p_job_id AND worker_id <> p_worker_id AND status = 'pending';

  INSERT INTO public.notifications (user_id, job_id, title, message, type)
  VALUES (
    v_job.provider_id,
    p_job_id,
    'Worker accepted your job',
    COALESCE(v_worker_name, 'A worker') || ' has accepted your job posting.',
    'job_accepted'
  );

  RETURN jsonb_build_object('success', true, 'job', to_jsonb(v_job));
END;
$$;