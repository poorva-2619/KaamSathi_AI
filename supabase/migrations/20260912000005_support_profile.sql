-- Migration: Support Profile

-- 1. Update the role constraint to allow 'admin'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('job_provider', 'service_provider', 'admin'));

-- 2. Insert Support Profile
INSERT INTO public.profiles (id, full_name, role, bio)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'KaamSathi Support',
    'admin',
    'Official support channel'
)
ON CONFLICT (id) DO NOTHING;
