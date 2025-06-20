
-- Add a theme preference column to user profiles (values: 'light', 'dark', 'system')
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'system';

-- Optional: policy not needed since full row select/update expected for profile
