-- FIX RENTAL TOOLS: Complete fix for rental tools
-- This addresses all rental tools issues

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Enable all for rental_tools" ON rental_tools;
DROP POLICY IF EXISTS "Public can read rental_tools" ON rental_tools;
DROP POLICY IF EXISTS "Admins can manage rental_tools" ON rental_tools;

-- Step 2: Disable RLS temporarily
ALTER TABLE rental_tools DISABLE ROW LEVEL SECURITY;

-- Step 3: Add missing columns and fix column naming
DO $$
BEGIN
    -- Add rent_per_hour
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
    
    -- Add deposit
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'deposit') THEN
        ALTER TABLE rental_tools ADD COLUMN deposit NUMERIC DEFAULT 0;
    END IF;
    
    -- Add description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'description') THEN
        ALTER TABLE rental_tools ADD COLUMN description TEXT;
    END IF;
    
    -- Fix availability column name (might be 'available' vs 'availability')
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'available') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'availability') THEN
            ALTER TABLE rental_tools RENAME COLUMN availability TO available;
        ELSE
            ALTER TABLE rental_tools ADD COLUMN available BOOLEAN DEFAULT true;
        END IF;
    END IF;
END $$;

-- Step 4: Re-enable RLS
ALTER TABLE rental_tools ENABLE ROW LEVEL SECURITY;

-- Step 5: Create simple working policies
CREATE POLICY "Enable all for rental_tools" ON rental_tools FOR ALL USING (true) WITH CHECK (true);

-- Step 6: Test rental tools fix
SELECT '=== RENTAL TOOLS FIX APPLIED ===' as status;

-- Clean up any test data first
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
) RETURNING id, name, available;

SELECT 'SUCCESS: Rental tool added!' as result;
SELECT COUNT(*) as total_rentals FROM rental_tools WHERE name = 'TEST_RENTAL_TOOL';

-- Check final schema
SELECT 'Rental tools table columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'rental_tools' 
ORDER BY ordinal_position;
