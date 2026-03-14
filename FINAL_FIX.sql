-- FINAL FIX: Replace all existing policies with working ones
-- Run this after DIAGNOSE.sql to understand the issue

-- Drop ALL existing policies on products
DROP POLICY IF EXISTS "Public can read products" ON products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for users based on email" ON products;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON products;

-- Drop ALL existing policies on rental_tools
DROP POLICY IF EXISTS "Public can read rental_tools" ON rental_tools;
DROP POLICY IF EXISTS "Authenticated users can manage rental_tools" ON rental_tools;
DROP POLICY IF EXISTS "Enable read access for all users" ON rental_tools;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON rental_tools;
DROP POLICY IF EXISTS "Enable update for users based on email" ON rental_tools;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON rental_tools;

-- Create NEW working policies for products
CREATE POLICY "Public can read products" 
  ON products FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Admins can manage products" 
  ON products FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Create NEW working policies for rental_tools
CREATE POLICY "Public can read rental_tools" 
  ON rental_tools FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Admins can manage rental_tools" 
  ON rental_tools FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Test the policies
SELECT 'Policies recreated successfully' as status;
SELECT COUNT(*) as product_count FROM products;
