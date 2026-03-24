-- Migration: Move legacy services from "products" to "services" table
-- Description: Ensures strict domain separation by verifying that no services exist in the products table.

BEGIN;

-- 1. Insert any products with type = 'service' into the services table.
INSERT INTO services (
  id,
  name,
  slug,
  category,
  price,
  description,
  duration,
  image_path,
  is_active,
  is_featured,
  created_at
)
SELECT 
  id,
  name,
  slug,
  COALESCE(category, 'services'),
  price,
  description,
  COALESCE(experience_config->>'duration', '1 hour'),
  COALESCE(image_url, image),
  is_active,
  is_featured,
  created_at
FROM 
  products
WHERE 
  type = 'service'
ON CONFLICT (id) DO NOTHING;

-- 2. Delete those migrated services from the products table so they don't appear in the storefront / admin products list.
DELETE FROM products WHERE type = 'service';

COMMIT;
