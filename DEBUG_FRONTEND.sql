-- DEBUG FRONTEND: Test what the frontend is actually trying to do
-- This simulates the exact insert your frontend is attempting

-- First, let's see what your frontend API is trying to insert
-- Based on the error, it seems like there might be a mismatch

-- Check the exact structure expected by your frontend
SELECT '=== EXPECTED FRONTEND STRUCTURE ===' as info;
SELECT 'Product should have: id, name, brand, category, price, wholesale_price, image_url, stock, in_stock, description' as expected;

-- Test the exact insert your frontend does
SELECT '=== TESTING EXACT FRONTEND INSERT ===' as test;

-- This is what your frontend API.ts is trying to do:
-- productToDb() converts frontend Product to database format
-- Let's simulate that exact operation

-- Test 1: Simple insert with all required fields
SELECT 'Test 1: Basic product insert' as test_name;
INSERT INTO products (
  name, 
  brand, 
  category, 
  price, 
  wholesale_price, 
  image_url, 
  stock, 
  in_stock, 
  description
) VALUES (
  'Test Product',
  'INGCO', 
  'Power Tools',
  100.0,
  80.0,
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop',
  10,
  true,
  'Test description'
) RETURNING *;

-- Test 2: Check if the product was actually inserted
SELECT 'Test 2: Verify product was inserted' as test_name;
SELECT COUNT(*) as total_products FROM products WHERE name = 'Test Product';

-- Test 3: Test rental tool insert
SELECT 'Test 3: Rental tool insert' as test_name;
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
  'Test Rental Tool',
  'INGCO',
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop',
  50.0,
  10.0,
  100.0,
  true,
  'Test rental description'
) RETURNING *;

SELECT '=== ALL TESTS COMPLETED ===' as status;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_rentals FROM rental_tools;
