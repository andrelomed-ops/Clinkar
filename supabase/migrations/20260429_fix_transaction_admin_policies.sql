-- Migración para asegurar que los administradores puedan gestionar transacciones y cobros
-- v5.0.2 - Emergency Security Fix

-- 1. Permitir que los administradores actualicen cualquier transacción (para cobro de comisiones)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Admins can update all transactions') THEN
        DROP POLICY "Admins can update all transactions" ON transactions;
    END IF;
END $$;

CREATE POLICY "Admins can update all transactions"
ON transactions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.email = 'starterkar@hotmail.com')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.email = 'starterkar@hotmail.com')
  )
);

-- 2. Asegurar permisos de lectura total para admins en transacciones
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Admins can view all transactions') THEN
        DROP POLICY "Admins can view all transactions" ON transactions;
    END IF;
END $$;

CREATE POLICY "Admins can view all transactions"
ON transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.email = 'starterkar@hotmail.com')
  )
);
