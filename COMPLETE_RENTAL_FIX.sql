-- COMPLETE RENTAL TOOLS FIX: Everything at once
-- This handles schema, RLS, and data issues for rental tools

-- Step 1: Drop all existing rental policies
DROP POLICY IF EXISTS "Enable all for rental_tools" ON rental_tools;
DROP POLICY IF EXISTS "Public can read rental_tools" ON rental_tools;
DROP POLICY IF EXISTS "Admins can manage rental_tools" ON rental_tools;
DROP POLICY IF EXISTS "Enable read access for all users" ON rental_tools;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON rental_tools;
DROP POLICY IF EXISTS "Enable update for users based on email" ON rental_tools;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON rental_tools;

-- Step 2: Temporarily disable RLS to fix schema
ALTER TABLE rental_tools DISABLE ROW LEVEL SECURITY;

-- Step 3: Add ALL missing columns and fix naming
DO $$
BEGIN
    -- Add rent_per_hour column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'rent_per_hour') THEN
        ALTER TABLE rental_tools ADD COLUMN rent_per_hour NUMERIC DEFAULT 0;
    END IF;
    
    -- Handle image_url vs image column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'image_url') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'image') THEN
            ALTER TABLE rental_tools RENAME COLUMN image TO image_url;
        ELSE
            ALTER TABLE rental_tools ADD COLUMN image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop';
        END IF;
    END IF;
    
    -- Add deposit column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'deposit') THEN
        ALTER TABLE rental_tools ADD COLUMN deposit NUMERIC DEFAULT 0;
    END IF;
    
    -- Add description column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'description') THEN
        ALTER TABLE rental_tools ADD COLUMN description TEXT;
    END IF;
    
    -- Fix availability column (handle both string and boolean cases)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'available') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'availability') THEN
            -- Convert string availability to boolean
            ALTER TABLE rental_tools ADD COLUMN available BOOLEAN DEFAULT true;
            UPDATE rental_tools SET available = CASE WHEN availability = 'Available' THEN true ELSE false END;
            ALTER TABLE rental_tools DROP COLUMN availability;
        ELSE
            ALTER TABLE rental_tools ADD COLUMN available BOOLEAN DEFAULT true;
        END IF;
    END IF;
    
    -- Add brand column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'brand') THEN
        ALTER TABLE rental_tools ADD COLUMN brand TEXT DEFAULT 'INGCO';
    END IF;
END $$;

-- Step 4: Re-enable RLS
ALTER TABLE rental_tools ENABLE ROW LEVEL SECURITY;

-- Step 5: Create simple working policies
CREATE POLICY "Public can read rental_tools" 
  ON rental_tools FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Authenticated users can manage rental_tools" 
  ON rental_tools FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Step 6: Test the fix
SELECT '=== RENTAL TOOLS COMPLETE FIX APPLIED ===' as status;

-- Clean up any test data
DELETE FROM rental_tools WHERE name = 'TEST_RENTAL_TOOL';

-- Test insert with all required fields
INSERT INTO rental_tools (
  name,
  brand,
  image_url,
  rent_per_day,
  rent_per_hour,
  deposit,
  available,
  description
) VALUES (
  'TEST_RENTAL_TOOL',
  'INGCO',
  'https://test.com/rental.jpg',
  50.0,
  10.0,
  100.0,
  true,
  'Test rental description'
) RETURNING id, name, available, rent_per_day;

SELECT 'SUCCESS: Rental tool added with all fields!' as result;
SELECT COUNT(*) as total_rentals FROM rental_tools WHERE name = 'TEST_RENTAL_TOOL';

-- Show final schema
SELECT 'Final rental tools table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'rental_tools' 
ORDER BY ordinal_position;
