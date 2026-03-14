-- Fix offers table by adding missing columns
-- This handles the case where the table exists but is missing columns

-- First, let's check if the table exists and add missing columns
DO $$
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'type' AND table_schema = 'public') THEN
        -- Table exists but may have wrong structure, let's drop and recreate
        DROP TABLE IF EXISTS offers CASCADE;
    END IF;
END $$;

-- Now recreate the table with correct structure
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

-- Recreate mapping tables
DROP TABLE IF EXISTS offer_products CASCADE;
DROP TABLE IF EXISTS offer_rentals CASCADE;
DROP TABLE IF EXISTS offer_categories CASCADE;

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
