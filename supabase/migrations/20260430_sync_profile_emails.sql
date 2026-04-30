-- Migration: Sync Profile Emails
-- Description: Ensures email column exists in profiles and is synced from auth.users.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing profiles with emails from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Create or replace the sync trigger function
CREATE OR REPLACE FUNCTION public.handle_user_email_sync()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger on auth.users for updates
DROP TRIGGER IF EXISTS on_auth_user_updated_sync_email ON auth.users;
CREATE TRIGGER on_auth_user_updated_sync_email
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_sync();

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
