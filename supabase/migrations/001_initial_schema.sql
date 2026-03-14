-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  wholesale_price NUMERIC,
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create rental_tools table
CREATE TABLE IF NOT EXISTS rental_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rent_per_day NUMERIC NOT NULL,
  deposit NUMERIC NOT NULL,
  availability TEXT NOT NULL DEFAULT 'Available',
  description TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create enquiries table
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Product', 'Rental', 'General')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- ========== PRODUCTS POLICIES ==========
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Only admin can read products" ON products;
DROP POLICY IF EXISTS "Only admin can insert products" ON products;
DROP POLICY IF EXISTS "Only admin can update products" ON products;
DROP POLICY IF EXISTS "Only admin can delete products" ON products;

-- Only authenticated (admin) users can SELECT products
CREATE POLICY "Only admin can read products"
  ON products FOR SELECT
  TO authenticated
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
  USING (true);

-- Only authenticated (admin) users can DELETE products
CREATE POLICY "Only admin can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- ========== RENTAL_TOOLS POLICIES ==========
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Only admin can read rental_tools" ON rental_tools;
DROP POLICY IF EXISTS "Only admin can insert rental_tools" ON rental_tools;
DROP POLICY IF EXISTS "Only admin can update rental_tools" ON rental_tools;
DROP POLICY IF EXISTS "Only admin can delete rental_tools" ON rental_tools;

-- Only authenticated (admin) users can SELECT rental_tools
CREATE POLICY "Only admin can read rental_tools"
  ON rental_tools FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated (admin) users can INSERT rental_tools
CREATE POLICY "Only admin can insert rental_tools"
  ON rental_tools FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated (admin) users can UPDATE rental_tools
CREATE POLICY "Only admin can update rental_tools"
  ON rental_tools FOR UPDATE
  TO authenticated
  USING (true);

-- Only authenticated (admin) users can DELETE rental_tools
CREATE POLICY "Only admin can delete rental_tools"
  ON rental_tools FOR DELETE
  TO authenticated
  USING (true);

-- ========== ENQUIRIES POLICIES ==========
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can insert enquiries" ON enquiries;
DROP POLICY IF EXISTS "Only admin can read enquiries" ON enquiries;

-- Public can INSERT enquiries
CREATE POLICY "Public can insert enquiries"
  ON enquiries FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated (admin) users can SELECT enquiries
CREATE POLICY "Only admin can read enquiries"
  ON enquiries FOR SELECT
  TO authenticated
  USING (true);
