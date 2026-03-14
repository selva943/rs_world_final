-- CHECK SCHEMA: See what columns actually exist
-- Run this to understand the real table structure

-- Check products table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Check rental_tools table structure  
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'rental_tools' 
ORDER BY ordinal_position;

-- Show sample data from products (if any)
SELECT 'Sample products data:' as info;
SELECT * FROM products LIMIT 3;

-- Show sample data from rental_tools (if any)
SELECT 'Sample rental_tools data:' as info;
SELECT * FROM rental_tools LIMIT 3;
