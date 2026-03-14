-- Fix RLS policies to allow public reads for products and rental tools
-- Only authenticated users can create/update/delete

-- ========== PRODUCTS POLICIES FIX ==========
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Only admin can read products" ON products;
DROP POLICY IF EXISTS "Only admin can insert products" ON products;
DROP POLICY IF EXISTS "Only admin can update products" ON products;
DROP POLICY IF EXISTS "Only admin can delete products" ON products;

-- Public can READ products (for website display)
CREATE POLICY "Public can read products"
  ON products FOR SELECT
  TO public
  USING (true);

-- Only authenticated (admin) users can INSERT products
CREATE POLICY "Only admin can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated (admin) users can UPDATE products
CREATE POLICY "Only admin can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated (admin) users can DELETE products
CREATE POLICY "Only admin can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- ========== RENTAL_TOOLS POLICIES FIX ==========
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Only admin can read rental_tools" ON rental_tools;
DROP POLICY IF EXISTS "Only admin can insert rental_tools" ON rental_tools;
DROP POLICY IF EXISTS "Only admin can update rental_tools" ON rental_tools;
DROP POLICY IF EXISTS "Only admin can delete rental_tools" ON rental_tools;

-- Public can READ rental tools (for website display)
CREATE POLICY "Public can read rental_tools"
  ON rental_tools FOR SELECT
  TO public
  USING (true);

-- Only authenticated (admin) users can INSERT rental tools
CREATE POLICY "Only admin can insert rental_tools"
  ON rental_tools FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated (admin) users can UPDATE rental tools
CREATE POLICY "Only admin can update rental_tools"
  ON rental_tools FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated (admin) users can DELETE rental tools
CREATE POLICY "Only admin can delete rental_tools"
  ON rental_tools FOR DELETE
  TO authenticated
  USING (true);
