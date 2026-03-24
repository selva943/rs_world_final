-- PALANI BASKET – FULL DATABASE SCHEMA (FINAL VERSION)
-- Drops legacy tables and creates a fresh, high-performance structure

-- 0. CLEAN SLATE (DROP EVERYTHING)
DROP TABLE IF EXISTS offer_usage CASCADE;
DROP TABLE IF EXISTS offer_products CASCADE;
DROP TABLE IF EXISTS offer_categories CASCADE;
DROP TABLE IF EXISTS offer_combos CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS uploads CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS enquiries CASCADE;
DROP TABLE IF EXISTS products CASCADE;

DROP TYPE IF EXISTS product_type CASCADE;
DROP TYPE IF EXISTS product_category CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS offer_type CASCADE;
DROP TYPE IF EXISTS discount_type CASCADE;

-- 🔹 1. ENUMS (CORE TYPES)
-- Product Type
CREATE TYPE product_type AS ENUM (
  'product',
  'service',
  'subscription',
  'booking'
);

-- Categories
CREATE TYPE product_category AS ENUM (
  'vegetables',
  'fruits',
  'daily_essentials',
  'recipe_kits',
  'services',
  'subscriptions',
  'bookings'
);

-- Order Status
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

-- Offer Types
CREATE TYPE offer_type AS ENUM (
  'product',
  'category',
  'combo'
);

-- Discount Types
CREATE TYPE discount_type AS ENUM (
  'percentage',
  'fixed'
);

-- 🥦 2. PRODUCTS TABLE (MAIN CORE TABLE)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  slug TEXT UNIQUE,

  category product_category NOT NULL,
  type product_type NOT NULL DEFAULT 'product',

  price NUMERIC NOT NULL,
  stock INTEGER DEFAULT 100,

  description TEXT,
  image TEXT,
  media JSONB DEFAULT '[]',

  -- Recipe Kit
  is_recipe_kit BOOLEAN DEFAULT false,
  is_veg BOOLEAN DEFAULT true,
  serving_size TEXT,
  cooking_time TEXT,

  -- Service
  service_type TEXT,
  service_price_type TEXT DEFAULT 'fixed',

  -- Subscription
  subscription_type TEXT,
  subscription_frequency TEXT,

  -- Common Flags
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 🛒 3. ORDERS TABLE
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,

  product_id UUID REFERENCES products(id) ON DELETE SET NULL,

  quantity INTEGER DEFAULT 1,
  total_amount NUMERIC,

  delivery_type TEXT DEFAULT 'Home Delivery',
  scheduled_time TIMESTAMPTZ,

  status order_status DEFAULT 'pending',

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 🎯 4. OFFERS TABLE
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  slug TEXT UNIQUE,

  description TEXT,

  offer_type offer_type DEFAULT 'product',

  discount_type discount_type DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL,

  min_quantity INTEGER DEFAULT 1,
  max_discount NUMERIC,

  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,

  banner_image TEXT,
  badge TEXT,

  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 🔗 5. OFFER RELATION TABLES
-- Product-based offers
CREATE TABLE offer_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE
);

-- Category-based offers
CREATE TABLE offer_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  category product_category
);

-- Combo offers
CREATE TABLE offer_combos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE
);

-- 📊 6. OFFER USAGE (TRACKING)
CREATE TABLE offer_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  offer_id UUID REFERENCES offers(id),
  order_id UUID REFERENCES orders(id),

  customer_phone TEXT,

  discount_applied NUMERIC,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 🖼️ 7. UPLOADS (MEDIA LIBRARY)
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  file_url TEXT NOT NULL,
  file_type TEXT,

  product_id UUID REFERENCES products(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 💬 8. TESTIMONIALS
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT,
  message TEXT,
  rating INTEGER DEFAULT 5,

  media TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 📩 9. ENQUIRIES
CREATE TABLE enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT,
  phone TEXT,
  message TEXT,

  type TEXT DEFAULT 'general',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 🔐 10. RLS (SECURITY – SUPABASE READY)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- ✅ Public Read
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read Offers" ON offers FOR SELECT USING (true);
CREATE POLICY "Public Read Testimonials" ON testimonials FOR SELECT USING (true);

-- ✅ Public Insert
CREATE POLICY "Public Orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Enquiry" ON enquiries FOR INSERT WITH CHECK (true);

-- ✅ Admin Full Access
CREATE POLICY "Admin Full Products" ON products FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Full Orders" ON orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Full Offers" ON offers FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Full Offer Products" ON offer_products FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Full Offer Categories" ON offer_categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Full Offer Combos" ON offer_combos FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Full Offer Usage" ON offer_usage FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Full Uploads" ON uploads FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Full Testimonials" ON testimonials FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin Full Enquiries" ON enquiries FOR ALL TO authenticated USING (true);
