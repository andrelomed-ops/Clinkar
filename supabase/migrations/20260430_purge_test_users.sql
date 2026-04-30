-- Purge Test Users (v6.0.3)
-- Description: Removes test accounts from public.profiles and auth.users to clear space for real users.

DO $$
DECLARE
    test_user_ids UUID[] := ARRAY[
        'cbc0c109-1c04-47fd-89c0-39e30c86a47a', -- Test User
        '448f9027-6fa6-4b45-be0e-459d4179bcb4', -- Test Buyer
        '6e84e4ff-c374-4562-87ca-bf4d62093d3d', -- Tester Clinkar
        'c7e981ef-4661-4c04-9f9b-bdbb4ddf1392', -- Tester Antigravity
        '620d50a7-81c1-4fde-aebb-2ff02cfaaa52', -- Agent Test
        'cf0a8366-bd6d-488f-9625-8543fa3c9e96', -- Test User (testvercel)
        '688be19e-3015-4585-a0cd-dd1b9629bf3a'  -- Test User (Anonymous)
    ];
BEGIN
    -- 1. Delete from public.profiles (Cascade should handle related public data)
    DELETE FROM public.profiles WHERE id = ANY(test_user_ids);
    
    -- 2. Delete from auth.users (This requires superuser or being run via migration)
    DELETE FROM auth.users WHERE id = ANY(test_user_ids);
    
    -- 3. Delete any orphaned data in analytics/audit logs if necessary
    DELETE FROM public.audit_logs WHERE actor_id = ANY(test_user_ids);
END $$;
