-- 007_admin_upgrade.sql

-- 1. Update products table
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing slugs based on name
UPDATE products SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;

-- 2. Update orders table
ALTER TABLE orders 
  RENAME COLUMN contact TO phone;

ALTER TABLE orders 
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders 
  ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('draft', 'in_progress', 'scheduled', 'delivered'));

-- 3. Update uploads table
ALTER TABLE uploads 
  RENAME COLUMN file_path TO file_url;

ALTER TABLE uploads 
  RENAME COLUMN uploaded_at TO created_at;

-- 4. Update testimonials table
ALTER TABLE testimonials 
  RENAME COLUMN user_name TO name;

ALTER TABLE testimonials 
  RENAME COLUMN content TO message;

ALTER TABLE testimonials 
  RENAME COLUMN image_url TO media;

-- 5. Create storage bucket (product-images)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- 6. Add is_active policy for products
DROP POLICY IF EXISTS "Public can read products" ON products;
CREATE POLICY "Public can read products" ON products FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
