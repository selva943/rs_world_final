-- Supabase Migration: Create Offer System Tables
-- File: supabase/migrations/20240310_create_offer_system.sql

-- Create the main offers table
CREATE TABLE IF NOT EXISTS "public"."offers" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "offer_name" VARCHAR(255) NOT NULL,
    "offer_description" TEXT,
    "offer_type" VARCHAR(50) NOT NULL CHECK ("offer_type" IN ('product', 'category', 'combo')),
    "discount_type" VARCHAR(50) NOT NULL CHECK ("discount_type" IN ('percentage', 'fixed')),
    "discount_value" DECIMAL(10,2) NOT NULL,
    "min_quantity" INTEGER DEFAULT 1,
    "max_discount" DECIMAL(10,2),
    "start_date" TIMESTAMPTZ DEFAULT NOW(),
    "end_date" TIMESTAMPTZ,
    "priority" INTEGER DEFAULT 0,
    "status" VARCHAR(50) DEFAULT 'active' CHECK ("status" IN ('active', 'inactive')),
    "banner_image_url" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Create offer_products table for product-specific offers
CREATE TABLE IF NOT EXISTS "public"."offer_products" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "offer_id" UUID NOT NULL REFERENCES "public"."offers"("id") ON DELETE CASCADE,
    "product_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("offer_id", "product_id")
);

-- Create offer_categories table for category-specific offers
CREATE TABLE IF NOT EXISTS "public"."offer_categories" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "offer_id" UUID NOT NULL REFERENCES "public"."offers"("id") ON DELETE CASCADE,
    "category_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("offer_id", "category_id")
);

-- Create offer_combos table for combo deals
CREATE TABLE IF NOT EXISTS "public"."offer_combos" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "offer_id" UUID NOT NULL REFERENCES "public"."offers"("id") ON DELETE CASCADE,
    "product_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("offer_id", "product_id")
);

-- Create offer_usage table for tracking
CREATE TABLE IF NOT EXISTS "public"."offer_usage" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "offer_id" UUID NOT NULL REFERENCES "public"."offers"("id") ON DELETE CASCADE,
    "user_id" VARCHAR(255) DEFAULT 'anonymous',
    "product_id" VARCHAR(255),
    "original_price" DECIMAL(10,2) DEFAULT 0,
    "discounted_price" DECIMAL(10,2) DEFAULT 0,
    "discount_amount" DECIMAL(10,2) DEFAULT 0,
    "quantity" INTEGER DEFAULT 1,
    "used_at" TIMESTAMPTZ DEFAULT NOW(),
    "ip_address" INET,
    "user_agent" TEXT,
    "session_id" VARCHAR(255)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "offers_status_idx" ON "public"."offers"("status");
CREATE INDEX IF NOT EXISTS "offers_type_idx" ON "public"."offers"("offer_type");
CREATE INDEX IF NOT EXISTS "offers_priority_idx" ON "public"."offers"("priority" DESC);
CREATE INDEX IF NOT EXISTS "offers_dates_idx" ON "public"."offers"("start_date", "end_date");
CREATE INDEX IF NOT EXISTS "offer_usage_offer_idx" ON "public"."offer_usage"("offer_id");
CREATE INDEX IF NOT EXISTS "offer_usage_date_idx" ON "public"."offer_usage"("used_at");

-- Enable Row Level Security
ALTER TABLE "public"."offers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."offer_products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."offer_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."offer_combos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."offer_usage" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable all operations on offers" ON "public"."offers" FOR ALL USING (true);
CREATE POLICY "Enable all operations on offer_products" ON "public"."offer_products" FOR ALL USING (true);
CREATE POLICY "Enable all operations on offer_categories" ON "public"."offer_categories" FOR ALL USING (true);
CREATE POLICY "Enable all operations on offer_combos" ON "public"."offer_combos" FOR ALL USING (true);
CREATE POLICY "Enable all operations on offer_usage" ON "public"."offer_usage" FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION "public"."handle_updated_at"()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updated_at" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for offers table
CREATE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."offers" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();

-- Insert sample data
INSERT INTO "public"."offers" (
    "offer_name", 
    "offer_description", 
    "offer_type", 
    "discount_type", 
    "discount_value", 
    "min_quantity",
    "priority",
    "status",
    "banner_image_url"
) VALUES 
(
    'Summer Sale 2024',
    'Get amazing discounts on all INGCO tools this summer',
    'product',
    'percentage',
    20.00,
    1,
    100,
    'active',
    'https://example.com/summer-sale.jpg'
),
(
    'Power Tools Bundle',
    'Special combo deal on power tools',
    'combo',
    'percentage',
    25.00,
    2,
    90,
    'active',
    'https://example.com/power-bundle.jpg'
),
(
    'Hand Tools Discount',
    'Flat discount on all hand tools',
    'category',
    'fixed',
    150.00,
    1,
    80,
    'active',
    'https://example.com/hand-tools.jpg'
) ON CONFLICT DO NOTHING;
