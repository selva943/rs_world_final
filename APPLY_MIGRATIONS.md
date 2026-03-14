# Database Migration Instructions

## 🚨 IMPORTANT: Apply These Migrations to Supabase

Your frontend is ready but the database needs the new schema. Follow these steps:

### Step 1: Go to Supabase Dashboard
1. Visit https://supabase.com/dashboard
2. Select your project: `cavphnjgjkxlnhbwvuzk`

### Step 2: Apply RLS Policies Fix
1. Go to **SQL Editor** in the left menu
2. Copy and paste the contents of: `supabase/migrations/002_fix_rls_policies.sql`
3. Click **Run** to execute the migration
4. Verify success (should show "Success" message)

### Step 3: Fix Offers Table (CRITICAL)
1. In the same **SQL Editor**, copy and paste: `supabase/migrations/004_fix_offers_table.sql`
2. Click **Run** to execute the migration
3. Verify success (should show "Success" message)
4. This fixes the "end_date does not exist" error

### Step 4: Apply Offers RLS Policies
1. Copy and paste: `supabase/migrations/005_fix_offers_rls.sql`
2. Click **Run** to execute the migration
3. Verify success (should show "Success" message)

### Step 5: Verify Tables
1. Go to **Table Editor** in the left menu
2. You should see:
   - `products` table
   - `rental_tools` table  
   - `offers` table (with all columns including end_date)
   - `offer_products` table
   - `offer_rentals` table
   - `offer_categories` table

## ✅ After Applying Migrations

Once migrations are applied, your system will work correctly:

- ✅ Products will save and display immediately
- ✅ Rental tools will work reliably
- ✅ Offers system will be fully functional
- ✅ Real-time updates will work across all tabs
- ✅ No more "insert errors" or RLS policy issues

## 🔧 Troubleshooting

If you get errors:
1. Make sure you're applying migrations in the correct order: 002 → 004 → 005
2. Skip 003 since it conflicts with existing table
3. Check that you're in the right project (`cavphnjgjkxlnhbwvuzk`)
4. Refresh the page after applying migrations

## 🧪 Test Everything

After migrations, test:
1. Admin Dashboard: http://localhost:5173/admin
2. Add a product → should appear immediately
3. Add a rental tool → should appear immediately  
4. Create an offer → should appear in offers tab
5. Check home page → should show all data correctly
