-- Set StarterKar@hotmail.com as admin
-- Run this in Supabase SQL editor to make the admin user

UPDATE profiles 
SET role = 'admin' 
WHERE email = 'StarterKar@hotmail.com';

-- If the user doesn't exist yet, insert them with admin role
-- (for when they first sign up with Google)
INSERT INTO profiles (id, email, full_name, role)
SELECT 
    gen_random_uuid(),
    'StarterKar@hotmail.com',
    'StarterKar Admin',
    'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE email = 'StarterKar@hotmail.com'
);