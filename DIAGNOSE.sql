-- DIAGNOSE: Check what's happening with RLS policies
-- Run this to understand the current state

-- 1. Check existing RLS policies on products
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY policyname;

-- 2. Check existing RLS policies on rental_tools
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'rental_tools'
ORDER BY policyname;

-- 3. Test if you can read products as public (this should work)
SELECT 'Testing public read on products:' as test;
SELECT COUNT(*) as product_count FROM products;

-- 4. Test if you can insert a test product (this will show the real error)
-- This will fail but show us the exact error
SELECT 'Testing insert (this will show the real error):' as test;
INSERT INTO products (name, brand, category, price, stock, image_url, description, in_stock) 
VALUES ('TEST_PRODUCT', 'INGCO', 'Power Tools', 100, 10, 'https://test.com/test.jpg', 'Test description', true);

-- 5. Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity,
  forcerlspolicy
FROM pg_tables 
WHERE tablename IN ('products', 'rental_tools');
