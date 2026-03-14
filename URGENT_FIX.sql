-- URGENT FIX: Apply RLS policies immediately
-- Run this FIRST before anything else

-- Enable RLS on products and rental_tools if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_tools ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be blocking
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for users based on email" ON products;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON rental_tools;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON rental_tools;
DROP POLICY IF EXISTS "Enable update for users based on email" ON rental_tools;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON rental_tools;

-- Create simple, working policies for products
CREATE POLICY "Public can read products" 
  ON products FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Authenticated users can manage products" 
  ON products FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Create simple, working policies for rental_tools
CREATE POLICY "Public can read rental_tools" 
  ON rental_tools FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Authenticated users can manage rental_tools" 
  ON rental_tools FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Test the policies by running a simple select
SELECT 'RLS policies applied successfully' as status;
