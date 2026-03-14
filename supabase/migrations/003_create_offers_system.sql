-- Create offers system with proper schema

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('festival', 'combo')),
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value NUMERIC NOT NULL,
  applies_to TEXT NOT NULL CHECK (applies_to IN ('all', 'products', 'rentals', 'category')),
  category_name TEXT, -- Only used when applies_to = 'category'
  priority INTEGER NOT NULL DEFAULT 0,
  banner_image_url TEXT,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create offer_products mapping table
CREATE TABLE IF NOT EXISTS offer_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(offer_id, product_id)
);

-- Create offer_rentals mapping table
CREATE TABLE IF NOT EXISTS offer_rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  rental_tool_id UUID NOT NULL REFERENCES rental_tools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(offer_id, rental_tool_id)
);

-- Create offer_categories mapping table
CREATE TABLE IF NOT EXISTS offer_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(offer_id, category_name)
);

-- Enable Row Level Security for offers tables
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_categories ENABLE ROW LEVEL SECURITY;

-- ========== OFFERS POLICIES ==========
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read active offers" ON offers;
DROP POLICY IF EXISTS "Only admin can manage offers" ON offers;

-- Public can READ active offers (for website display)
CREATE POLICY "Public can read active offers"
  ON offers FOR SELECT
  TO public
  USING (status = 'active' AND (end_date IS NULL OR end_date > NOW()));

-- Only authenticated (admin) users can manage offers
CREATE POLICY "Only admin can manage offers"
  ON offers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ========== OFFER MAPPING POLICIES ==========
-- Public can read offer mappings (for calculating discounts)
DROP POLICY IF EXISTS "Public can read offer mappings" ON offer_products;
DROP POLICY IF EXISTS "Public can read offer mappings" ON offer_rentals;
DROP POLICY IF EXISTS "Public can read offer mappings" ON offer_categories;

CREATE POLICY "Public can read offer mappings"
  ON offer_products FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM offers 
    WHERE offers.id = offer_products.offer_id 
    AND offers.status = 'active' 
    AND (offers.end_date IS NULL OR offers.end_date > NOW())
  ));

CREATE POLICY "Public can read offer mappings"
  ON offer_rentals FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM offers 
    WHERE offers.id = offer_rentals.offer_id 
    AND offers.status = 'active' 
    AND (offers.end_date IS NULL OR offers.end_date > NOW())
  ));

CREATE POLICY "Public can read offer mappings"
  ON offer_categories FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM offers 
    WHERE offers.id = offer_categories.offer_id 
    AND offers.status = 'active' 
    AND (offers.end_date IS NULL OR offers.end_date > NOW())
  ));

-- Only authenticated (admin) users can manage offer mappings
DROP POLICY IF EXISTS "Only admin can manage offer mappings" ON offer_products;
DROP POLICY IF EXISTS "Only admin can manage offer mappings" ON offer_rentals;
DROP POLICY IF EXISTS "Only admin can manage offer mappings" ON offer_categories;

CREATE POLICY "Only admin can manage offer mappings"
  ON offer_products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only admin can manage offer mappings"
  ON offer_rentals FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only admin can manage offer mappings"
  ON offer_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
