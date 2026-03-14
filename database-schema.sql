-- Create normalized offer system database schema
-- This script creates all tables needed for the enhanced offer management system

-- 1. Main offers table
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_name VARCHAR(255) NOT NULL,
    offer_description TEXT,
    offer_type VARCHAR(50) NOT NULL CHECK (offer_type IN ('product', 'category', 'combo')),
    discount_type VARCHAR(50) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_quantity INTEGER DEFAULT 1,
    max_discount DECIMAL(10,2),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    priority INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    banner_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Offer products table (for product-specific offers)
CREATE TABLE IF NOT EXISTS offer_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(offer_id, product_id)
);

-- 3. Offer categories table (for category-specific offers)
CREATE TABLE IF NOT EXISTS offer_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    category_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(offer_id, category_id)
);

-- 4. Offer combos table (for combo deals)
CREATE TABLE IF NOT EXISTS offer_combos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(offer_id, product_id)
);

-- 5. Offer usage tracking table
CREATE TABLE IF NOT EXISTS offer_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    user_id VARCHAR(255) DEFAULT 'anonymous',
    product_id VARCHAR(255),
    original_price DECIMAL(10,2) DEFAULT 0,
    discounted_price DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    quantity INTEGER DEFAULT 1,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255)
);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_offer_type ON offers(offer_type);
CREATE INDEX IF NOT EXISTS idx_offers_priority ON offers(priority DESC);
CREATE INDEX IF NOT EXISTS idx_offers_dates ON offers(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_offer_usage_offer_id ON offer_usage(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_usage_used_at ON offer_usage(used_at);
CREATE INDEX IF NOT EXISTS idx_offer_usage_user_id ON offer_usage(user_id);

-- 7. Create RLS (Row Level Security) policies for Supabase
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_usage ENABLE ROW LEVEL SECURITY;

-- Policy for offers table (allow all operations for now, adjust as needed)
CREATE POLICY "Enable all operations on offers" ON offers
    FOR ALL USING (true);

-- Policy for offer_products table
CREATE POLICY "Enable all operations on offer_products" ON offer_products
    FOR ALL USING (true);

-- Policy for offer_categories table
CREATE POLICY "Enable all operations on offer_categories" ON offer_categories
    FOR ALL USING (true);

-- Policy for offer_combos table
CREATE POLICY "Enable all operations on offer_combos" ON offer_combos
    FOR ALL USING (true);

-- Policy for offer_usage table
CREATE POLICY "Enable all operations on offer_usage" ON offer_usage
    FOR ALL USING (true);

-- 8. Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for offers table
CREATE TRIGGER update_offers_updated_at 
    BEFORE UPDATE ON offers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Insert sample data for testing
INSERT INTO offers (
    offer_name, 
    offer_description, 
    offer_type, 
    discount_type, 
    discount_value, 
    min_quantity,
    priority,
    status,
    banner_image_url
) VALUES 
(
    'INGCO Tools Festival Sale',
    'Special discount on all INGCO power tools and hand tools',
    'product',
    'percentage',
    15.00,
    1,
    100,
    'active',
    'https://example.com/ingco-festival-banner.jpg'
),
(
    'Power Tools Combo Deal',
    'Get amazing deals when you buy multiple power tools together',
    'combo',
    'percentage',
    20.00,
    2,
    90,
    'active',
    'https://example.com/power-tools-combo.jpg'
),
(
    'Hand Tools Category Discount',
    'Special discount on all hand tools and measuring instruments',
    'category',
    'fixed',
    200.00,
    1,
    80,
    'active',
    'https://example.com/hand-tools-category.jpg'
) ON CONFLICT DO NOTHING;

-- 10. Insert sample product relationships
INSERT INTO offer_products (offer_id, product_id)
SELECT 
    o.id,
    'product-1'
FROM offers o 
WHERE o.offer_name = 'INGCO Tools Festival Sale'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO offer_categories (offer_id, category_id)
SELECT 
    o.id,
    'Power Tools'
FROM offers o 
WHERE o.offer_name = 'Power Tools Combo Deal'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO offer_combos (offer_id, product_id)
SELECT 
    o.id,
    'combo-product-1'
FROM offers o 
WHERE o.offer_name = 'Power Tools Combo Deal'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 11. Create view for offers with related data (optional but useful)
CREATE OR REPLACE VIEW offers_with_relations AS
SELECT 
    o.*,
    array_agg(op.product_id) as products,
    array_agg(oc.category_id) as categories,
    array_agg(ocp.product_id) as combo_products,
    COUNT(ou.id) as usage_count
FROM offers o
LEFT JOIN offer_products op ON o.id = op.offer_id
LEFT JOIN offer_categories oc ON o.id = oc.offer_id
LEFT JOIN offer_combos ocp ON o.id = ocp.offer_id
LEFT JOIN offer_usage ou ON o.id = ou.offer_id
GROUP BY o.id;
