-- Set StarterKar@hotmail.com as admin
-- Run this in Supabase SQL editor

-- Get user ID from auth.users and update profiles
UPDATE profiles 
SET role = 'admin' 
WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'StarterKar@hotmail.com'
    LIMIT 1
);