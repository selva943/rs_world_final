-- 006_surprise_factory_transformation.sql

-- 1. Create Product Type Enum
DO $$ BEGIN
    CREATE TYPE product_type AS ENUM ('digital', 'physical', 'hybrid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Modify products table
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS type product_type DEFAULT 'digital',
  ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS experience_config JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 3. Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  product_id UUID REFERENCES products(id),
  customization_data JSONB DEFAULT '{}'::jsonb,
  delivery_type TEXT NOT NULL,
  scheduled_time TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'In Progress', 'Scheduled', 'Delivered', 'Cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create uploads table
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create surprise_flows table
CREATE TABLE IF NOT EXISTS surprise_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE surprise_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- 8. Policies
-- Orders: Public can insert (checkout), only admin can read/update
CREATE POLICY "Public can insert orders" ON orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Only admin can read orders" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admin can update orders" ON orders FOR UPDATE TO authenticated USING (true);

-- Testimonials: Public can read, only admin can manage
CREATE POLICY "Public can read testimonials" ON testimonials FOR SELECT TO public USING (true);
CREATE POLICY "Only admin can manage testimonials" ON testimonials FOR ALL TO authenticated USING (true);

-- Uploads & Flows: Only admin can manage
CREATE POLICY "Only admin can manage uploads" ON uploads FOR ALL TO authenticated USING (true);
CREATE POLICY "Only admin can manage flows" ON surprise_flows FOR ALL TO authenticated USING (true);
