# Fix Database Schema Error

## ❌ Error: `column "offer_type" does not exist`

This error means the database schema hasn't been properly applied or there's a mismatch between expected and actual database structure.

## 🔍 Diagnose the Issue

### Step 1: Check Current Database Structure

Run this SQL in Supabase SQL Editor:

```sql
-- Check what columns actually exist in offers table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'offers' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### Step 2: Check if Tables Exist

```sql
-- Check if offer-related tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'offer_%'
ORDER BY table_name;
```

## 🛠️ Fix Options

### Option 1: Add Missing Columns (Recommended)

Run the `fix-database-schema.sql` file in Supabase SQL Editor. This will:
- ✅ Check for existing columns
- ✅ Add missing columns safely
- ✅ Preserve existing data

### Option 2: Complete Reset (If No Data to Keep)

If you don't need to preserve existing data:

```sql
-- Drop all offer-related tables
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS offer_products CASCADE;
DROP TABLE IF EXISTS offer_categories CASCADE;
DROP TABLE IF EXISTS offer_combos CASCADE;
DROP TABLE IF EXISTS offer_usage CASCADE;
```

Then run the complete schema from `supabase-migrations.sql`.

### Option 3: Manual Column Addition

Add missing columns manually:

```sql
-- Add missing offer_type column
ALTER TABLE offers ADD COLUMN IF NOT EXISTS offer_type VARCHAR(50) 
CHECK (offer_type IN ('product', 'category', 'combo'));

-- Add missing offer_name column
ALTER TABLE offers ADD COLUMN IF NOT EXISTS offer_name VARCHAR(255);

-- Add missing offer_description column
ALTER TABLE offers ADD COLUMN IF NOT EXISTS offer_description TEXT;

-- Add missing discount_type column
ALTER TABLE offers ADD COLUMN IF NOT EXISTS discount_type VARCHAR(50) 
CHECK (discount_type IN ('percentage', 'fixed'));

-- Add missing discount_value column
ALTER TABLE offers ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10,2);

-- Add missing banner_image_url column
ALTER TABLE offers ADD COLUMN IF NOT EXISTS banner_image_url TEXT;
```

## 🚀 Quick Fix Steps

### 1. Run Diagnosis SQL
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'offers' 
AND table_schema = 'public';
```

### 2. Apply Fix
- **If columns missing**: Run `fix-database-schema.sql`
- **If table missing**: Run complete `supabase-migrations.sql`

### 3. Verify Fix
```sql
-- Test inserting a sample offer
INSERT INTO offers (
    offer_name, 
    offer_type, 
    discount_type, 
    discount_value, 
    status
) VALUES (
    'Test Offer',
    'product',
    'percentage',
    10.00,
    'active'
);
```

### 4. Clean Up Test Data
```sql
DELETE FROM offers WHERE offer_name = 'Test Offer';
```

## 🔧 Common Issues & Solutions

### Issue: "permission denied for table offers"
**Solution**: Check RLS policies and your authentication

### Issue: "column already exists"
**Solution**: Use `IF NOT EXISTS` or drop and recreate

### Issue: "foreign key constraint fails"
**Solution**: Create related tables first (offer_products, offer_categories, etc.)

## 📞 If Still Facing Issues

1. **Check Supabase Dashboard** → Table Editor
2. **Verify Table Names** match exactly
3. **Check Column Names** are spelled correctly
4. **Ensure Proper Permissions** in RLS policies

## ✅ Success Indicators

When fixed, you should see:
- ✅ All 5 tables created
- ✅ All columns present in offers table
- ✅ Sample data insertion works
- ✅ Admin panel loads without errors
- ✅ Offer creation works in UI

Run the diagnosis SQL first, then apply the appropriate fix!
