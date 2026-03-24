-- 020_rebuild_recipe_kits.sql
-- Description: Establishes a clean relational schema for Recipe Kits with UOM support and dynamic pricing.

BEGIN;

-- 1. Extend Products Table for UOM System
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS base_unit TEXT DEFAULT 'unit',
ADD COLUMN IF NOT EXISTS conversion_factor NUMERIC DEFAULT 1.0;

-- 2. Ensure Recipes Table and Columns
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Veg',
ADD COLUMN IF NOT EXISTS prep_time TEXT DEFAULT '30 mins',
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS instructions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS portion_size INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS calories INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_seasonal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS orders_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Ensure Recipe Ingredients Table and Columns
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recipe_ingredients
ADD COLUMN IF NOT EXISTS quantity NUMERIC NOT NULL DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS uom TEXT NOT NULL DEFAULT 'pcs',
ADD COLUMN IF NOT EXISTS price_override NUMERIC,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 4. Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- 5. Policies (More Permissive for authenticated)
DROP POLICY IF EXISTS "Public Read Recipes" ON recipes;
CREATE POLICY "Public Read Recipes" ON recipes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Ingredients" ON recipe_ingredients;
CREATE POLICY "Public Read Ingredients" ON recipe_ingredients FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin All Recipes" ON recipes;
CREATE POLICY "Admin All Recipes" ON recipes FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Ingredients" ON recipe_ingredients;
CREATE POLICY "Admin All Ingredients" ON recipe_ingredients FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Also allow Anon to Insert for testing if not yet authenticated (Optional, but helps debug)
-- CREATE POLICY "Anon Insert Recipes" ON recipes FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Anon Insert Ingredients" ON recipe_ingredients FOR INSERT WITH CHECK (true);

COMMIT;
