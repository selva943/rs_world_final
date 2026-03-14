-- MASTER FIX: Complete solution for products, rental_tools, and offers
-- This fixes ALL issues at once

-- Step 1: Drop ALL existing policies
DROP POLICY IF EXISTS "Public can read products" ON products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;
DROP POLICY IF EXISTS "Public can read rental_tools" ON rental_tools;
DROP POLICY IF EXISTS "Authenticated users can manage rental_tools" ON rental_tools;
DROP POLICY IF EXISTS "Public can read active offers" ON offers;
DROP POLICY IF EXISTS "Only admin can manage offers" ON offers;

-- Step 2: Disable RLS temporarily
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE rental_tools DISABLE ROW LEVEL SECURITY;
ALTER TABLE offers DISABLE ROW LEVEL SECURITY;

-- Step 3: Fix PRODUCTS table
DO $$
BEGIN
    -- Add category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category') THEN
        ALTER TABLE products ADD COLUMN category TEXT DEFAULT 'Power Tools';
    END IF;
    
    -- Add wholesale_price
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'wholesale_price') THEN
        ALTER TABLE products ADD COLUMN wholesale_price NUMERIC DEFAULT 0;
    END IF;
    
    -- Add image_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image') THEN
            ALTER TABLE products RENAME COLUMN image TO image_url;
        ELSE
            ALTER TABLE products ADD COLUMN image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop';
        END IF;
    END IF;
    
    -- Add in_stock
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'in_stock') THEN
        ALTER TABLE products ADD COLUMN in_stock BOOLEAN DEFAULT true;
    END IF;
    
    -- Add description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'description') THEN
        ALTER TABLE products ADD COLUMN description TEXT;
    END IF;
    
    -- Make slug nullable
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'slug') THEN
        ALTER TABLE products ALTER COLUMN slug DROP NOT NULL;
    END IF;
END $$;

-- Step 4: Fix RENTAL_TOOLS table
DO $$
BEGIN
    -- Rename price_per_day to rent_per_day if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'price_per_day') THEN
        ALTER TABLE rental_tools RENAME COLUMN price_per_day TO rent_per_day;
    END IF;
    
    -- Add rent_per_day if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'rent_per_day') THEN
        ALTER TABLE rental_tools ADD COLUMN rent_per_day NUMERIC DEFAULT 0;
    END IF;
    
    -- Add rent_per_hour
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'rent_per_hour') THEN
        ALTER TABLE rental_tools ADD COLUMN rent_per_hour NUMERIC DEFAULT 0;
    END IF;
    
    -- Add image_url
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
    
    -- Add brand
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'brand') THEN
        ALTER TABLE rental_tools ADD COLUMN brand TEXT DEFAULT 'INGCO';
    END IF;
    
    -- Add available
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rental_tools' AND column_name = 'available') THEN
        ALTER TABLE rental_tools ADD COLUMN available BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Step 5: Re-enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Step 6: Create simple working policies
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

CREATE POLICY "Public can read active offers" 
  ON offers FOR SELECT 
  TO public 
  USING (status = 'active' AND (end_date IS NULL OR end_date > NOW()));

CREATE POLICY "Authenticated users can manage offers" 
  ON offers FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Step 7: Test everything
SELECT '=== MASTER FIX APPLIED ===' as status;

-- Clean up test data
DELETE FROM products WHERE name = 'TEST_PRODUCT';
DELETE FROM rental_tools WHERE name = 'TEST_RENTAL_TOOL';

-- Test product insert
INSERT INTO products (
  name, brand, category, price, wholesale_price, image_url, stock, in_stock, description
) VALUES (
  'TEST_PRODUCT', 'INGCO', 'Power Tools', 100.0, 80.0, 'https://test.com/test.jpg', 10, true, 'Test description'
) RETURNING id, name, category;

SELECT 'SUCCESS: Product added!' as result;

-- Test rental tool insert
INSERT INTO rental_tools (
  name, brand, image_url, rent_per_day, rent_per_hour, deposit, available, description
) VALUES (
  'TEST_RENTAL_TOOL', 'INGCO', 'https://test.com/rental.jpg', 50.0, 10.0, 100.0, true, 'Test rental description'
) RETURNING id, name, available, rent_per_day;

SELECT 'SUCCESS: Rental tool added!' as result;

-- Final verification
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_rentals FROM rental_tools;
SELECT '=== ALL SYSTEMS WORKING ===' as final_status;
