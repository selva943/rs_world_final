-- QUICK TEST: Check if RLS policies are working
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if RLS is enabled on products table
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  forcerlspolicy
FROM pg_tables 
WHERE tablename IN ('products', 'rental_tools', 'offers');

-- 2. Check existing RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('products', 'rental_tools', 'offers');

-- 3. Test if you can read products as public
-- This should return data if RLS is working correctly
SELECT COUNT(*) as product_count FROM products;

-- 4. Check if products table exists and has correct columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;
