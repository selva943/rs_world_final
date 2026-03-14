-- FINAL PRECISE FIX: Handle exact column constraints
-- This addresses the price_per_day vs rent_per_day issue

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Public can read products" ON products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;
DROP POLICY IF EXISTS "Public can read rental_tools" ON rental_tools;
DROP POLICY IF EXISTS "Authenticated users can manage rental_tools" ON rental_tools;

-- Step 2: Disable RLS temporarily
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE rental_tools DISABLE ROW LEVEL SECURITY;

-- Step 3: Check and fix rental_tools column constraints
DO $$
BEGIN
    -- Check if price_per_day exists and needs to be renamed to rent_per_day
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'price_per_day') THEN
        ALTER TABLE rental_tools RENAME COLUMN price_per_day TO rent_per_day;
    END IF;
    
    -- Add rent_per_day if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'rent_per_day') THEN
        ALTER TABLE rental_tools ADD COLUMN rent_per_day NUMERIC DEFAULT 0;
    END IF;
    
    -- Add rent_per_hour if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'rent_per_hour') THEN
        ALTER TABLE rental_tools ADD COLUMN rent_per_hour NUMERIC DEFAULT 0;
    END IF;
    
    -- Add image_url if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'image_url') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'image') THEN
            ALTER TABLE rental_tools RENAME COLUMN image TO image_url;
        ELSE
            ALTER TABLE rental_tools ADD COLUMN image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop';
        END IF;
    END IF;
    
    -- Add deposit if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'deposit') THEN
        ALTER TABLE rental_tools ADD COLUMN deposit NUMERIC DEFAULT 0;
    END IF;
    
    -- Add description if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'description') THEN
        ALTER TABLE rental_tools ADD COLUMN description TEXT;
    END IF;
    
    -- Add brand if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'brand') THEN
        ALTER TABLE rental_tools ADD COLUMN brand TEXT DEFAULT 'INGCO';
    END IF;
    
    -- Add available if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'available') THEN
        ALTER TABLE rental_tools ADD COLUMN available BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Step 4: Re-enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_tools ENABLE ROW LEVEL SECURITY;

-- Step 5: Create simple working policies
CREATE POLICY "Public can read products" 
  ON products FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Authenticated users can manage products" 
  ON products FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

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
SELECT '=== FINAL PRECISE FIX APPLIED ===' as status;

-- Clean up test data
DELETE FROM rental_tools WHERE name = 'TEST_RENTAL_TOOL';

-- Test rental tool insert with correct column names
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

SELECT 'SUCCESS: Rental tool added with correct columns!' as result;
SELECT COUNT(*) as total_rentals FROM rental_tools WHERE name = 'TEST_RENTAL_TOOL';

-- Show final rental_tools structure
SELECT 'Final rental_tools table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'rental_tools' 
ORDER BY ordinal_position;
