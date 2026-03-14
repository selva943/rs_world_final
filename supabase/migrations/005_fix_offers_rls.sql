-- Fix offers RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read active offers" ON offers;
DROP POLICY IF EXISTS "Only admin can manage offers" ON offers;
DROP POLICY IF EXISTS "Public can read offer mappings" ON offer_products;
DROP POLICY IF EXISTS "Public can read offer mappings" ON offer_rentals;
DROP POLICY IF EXISTS "Public can read offer mappings" ON offer_categories;
DROP POLICY IF EXISTS "Only admin can manage offer mappings" ON offer_products;
DROP POLICY IF EXISTS "Only admin can manage offer mappings" ON offer_rentals;
DROP POLICY IF EXISTS "Only admin can manage offer mappings" ON offer_categories;

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

-- Public can read offer mappings (for calculating discounts)
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
