-- Unified Partners Table Migration
-- Adjusting 'partners' table to match the UI requirements in src/app/admin/partners/page.tsx

DO $$ 
BEGIN 
    -- 1. Rename company_name to name if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'company_name') THEN
        ALTER TABLE public.partners RENAME COLUMN company_name TO name;
    END IF;

    -- 2. Add address column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'address') THEN
        ALTER TABLE public.partners ADD COLUMN address TEXT;
    END IF;

    -- 3. Add city column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'city') THEN
        ALTER TABLE public.partners ADD COLUMN city TEXT;
    END IF;

    -- 4. Add phone column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'phone') THEN
        ALTER TABLE public.partners ADD COLUMN phone TEXT;
    END IF;

    -- 5. Add is_active column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'is_active') THEN
        ALTER TABLE public.partners ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;

    -- 6. Ensure specialties exists (just in case)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'specialties') THEN
        ALTER TABLE public.partners ADD COLUMN specialties TEXT[] DEFAULT '{}';
    END IF;

END $$;
