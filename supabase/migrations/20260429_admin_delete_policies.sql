-- MIGRATION: Add DELETE policies for Admin users across all inventory-related tables
-- Purpose: Enable "Nuclear Deletion" (v4.7) from the Admin Dashboard

-- 1. Inspection Reports
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can delete reports" ON inspection_reports_150;
EXCEPTION WHEN undefined_table THEN NULL; END $$;
CREATE POLICY "Admins can delete reports" ON inspection_reports_150 
FOR DELETE USING (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- 2. Repair Quotations
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can delete quotations" ON repair_quotations;
EXCEPTION WHEN undefined_table THEN NULL; END $$;
CREATE POLICY "Admins can delete quotations" ON repair_quotations 
FOR DELETE USING (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- 3. Logistics Orders
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can delete logistics" ON logistics_orders;
EXCEPTION WHEN undefined_table THEN NULL; END $$;
CREATE POLICY "Admins can delete logistics" ON logistics_orders 
FOR DELETE USING (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- 4. Warranty Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can delete warranties" ON warranty_policies;
EXCEPTION WHEN undefined_table THEN NULL; END $$;
CREATE POLICY "Admins can delete warranties" ON warranty_policies 
FOR DELETE USING (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- 5. Service Tickets
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can delete tickets" ON service_tickets;
EXCEPTION WHEN undefined_table THEN NULL; END $$;
CREATE POLICY "Admins can delete tickets" ON service_tickets 
FOR DELETE USING (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- 6. Transactions
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can delete transactions" ON transactions;
EXCEPTION WHEN undefined_table THEN NULL; END $$;
CREATE POLICY "Admins can delete transactions" ON transactions 
FOR DELETE USING (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- 7. Cars
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can delete cars" ON cars;
EXCEPTION WHEN undefined_table THEN NULL; END $$;
CREATE POLICY "Admins can delete cars" ON cars 
FOR DELETE USING (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- 8. User Favorites
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can delete favorites" ON user_favorites;
EXCEPTION WHEN undefined_table THEN NULL; END $$;
CREATE POLICY "Admins can delete favorites" ON user_favorites 
FOR DELETE USING (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- 9. Referrals
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can delete referrals" ON referrals;
EXCEPTION WHEN undefined_table THEN NULL; END $$;
CREATE POLICY "Admins can delete referrals" ON referrals 
FOR DELETE USING (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
