-- Enhanced Offer System Database Structure
-- Matches the exact specifications provided

-- 1. Main offers table (enhanced version)
CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    offer_name VARCHAR(255) NOT NULL,
    offer_description TEXT,
    offer_type VARCHAR(50) NOT NULL CHECK (offer_type IN ('product', 'category', 'combo')),
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_quantity INTEGER DEFAULT 1,
    max_discount DECIMAL(10,2),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    priority INTEGER DEFAULT 0,
    status BOOLEAN DEFAULT TRUE,
    banner_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. offer_products table (for product-specific offers)
CREATE TABLE IF NOT EXISTS offer_products (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER REFERENCES offers(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. offer_categories table (for category-wide offers)
CREATE TABLE IF NOT EXISTS offer_categories (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER REFERENCES offers(id) ON DELETE CASCADE,
    category_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. offer_combos table (for combo product relationships)
CREATE TABLE IF NOT EXISTS offer_combos (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER REFERENCES offers(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. offer_usage table (tracks offer usage in orders)
CREATE TABLE IF NOT EXISTS offer_usage (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER REFERENCES offers(id),
    order_id VARCHAR(255),
    customer_id VARCHAR(255),
    product_id VARCHAR(255),
    original_price DECIMAL(10,2),
    discounted_price DECIMAL(10,2),
    discount_applied DECIMAL(10,2),
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_type ON offers(offer_type);
CREATE INDEX IF NOT EXISTS idx_offers_priority ON offers(priority DESC);
CREATE INDEX IF NOT EXISTS idx_offers_dates ON offers(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_offer_usage_offer_id ON offer_usage(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_usage_created_at ON offer_usage(created_at);

-- 7. Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_offers_updated_at 
    BEFORE UPDATE ON offers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Insert sample data for testing
INSERT INTO offers (
    offer_name, 
    offer_description, 
    offer_type, 
    discount_type, 
    discount_value, 
    min_quantity,
    max_discount,
    start_date,
    end_date,
    priority,
    status,
    banner_image_url
) VALUES 
(
    'Summer Power Tools Combo',
    'Buy Drill Machine + Drill Bit Set and get ₹500 discount',
    'combo',
    'fixed',
    500.00,
    2,
    1000.00,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    100,
    TRUE,
    'https://example.com/power-tools-combo.jpg'
),
(
    'INGCO Product Special',
    '15% discount on selected INGCO products',
    'product',
    'percentage',
    15.00,
    1,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '60 days',
    90,
    TRUE,
    'https://example.com/ingco-special.jpg'
),
(
    'Hand Tools Category Discount',
    'Flat ₹200 discount on all hand tools',
    'category',
    'fixed',
    200.00,
    1,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '45 days',
    80,
    TRUE,
    'https://example.com/hand-tools-category.jpg'
);

-- 9. Add sample product relationships
INSERT INTO offer_combos (offer_id, product_id)
SELECT o.id, 'drill-machine-001'
FROM offers o 
WHERE o.offer_name = 'Summer Power Tools Combo'
LIMIT 1;

INSERT INTO offer_combos (offer_id, product_id)
SELECT o.id, 'drill-bit-set-001'
FROM offers o 
WHERE o.offer_name = 'Summer Power Tools Combo'
LIMIT 1;

INSERT INTO offer_products (offer_id, product_id)
SELECT o.id, 'ingco-drill-001'
FROM offers o 
WHERE o.offer_name = 'INGCO Product Special'
LIMIT 1;

INSERT INTO offer_categories (offer_id, category_id)
SELECT o.id, 'Hand Tools'
FROM offers o 
WHERE o.offer_name = 'Hand Tools Category Discount'
LIMIT 1;
