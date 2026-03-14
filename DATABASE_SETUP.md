# Database Setup for Offer System

This guide will help you set up the database schema for the new normalized offer system.

## 📋 Prerequisites

- Supabase account and project
- Supabase CLI installed
- Node.js and npm installed

## 🚀 Quick Setup

### 1. Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link to your project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Run the setup script

```bash
chmod +x setup-database.sh
./setup-database.sh
```

## 📁 Database Schema

The offer system uses the following tables:

### Main Tables

1. **offers** - Main offer information
2. **offer_products** - Product-specific offer relationships
3. **offer_categories** - Category-specific offer relationships
4. **offer_combos** - Combo deal product relationships
5. **offer_usage** - Usage tracking and analytics

### Schema Overview

```sql
offers (main offer data)
├── offer_products (for product-specific offers)
├── offer_categories (for category-specific offers)
├── offer_combos (for combo deals)
└── offer_usage (usage tracking)
```

## 🔧 Manual Setup

If you prefer to set up manually, follow these steps:

### 1. Create the main tables

Run the SQL commands in `database-schema.sql` or `supabase-migrations.sql`

### 2. Enable Row Level Security

The schema includes RLS policies that allow all operations. Adjust these as needed for your security requirements.

### 3. Generate TypeScript types

```bash
supabase gen types typescript --local > src/types/supabase.ts
```

## 📊 Sample Data

The schema includes sample data for testing:

- **Summer Sale 2024** - Product-specific offer (20% off)
- **Power Tools Bundle** - Combo deal (25% off)
- **Hand Tools Discount** - Category offer (₹150 off)

## 🛠️ API Integration

The offer system API expects the following structure:

### Offer Creation Example

```typescript
const newOffer = {
  offer_name: "Special Discount",
  offer_description: "Limited time offer",
  offer_type: "product", // 'product' | 'category' | 'combo'
  discount_type: "percentage", // 'percentage' | 'fixed'
  discount_value: 15.00,
  min_quantity: 1,
  max_discount: null,
  start_date: new Date().toISOString(),
  end_date: null,
  priority: 100,
  status: "active", // 'active' | 'inactive'
  banner_image_url: "https://example.com/banner.jpg",
  products: ["product-1", "product-2"], // for product offers
  categories: ["Power Tools"], // for category offers
  combo_products: ["product-1", "product-2"] // for combo offers
};
```

## 🔍 Testing the Setup

### 1. Check if tables exist

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'offer_%';
```

### 2. Verify sample data

```sql
SELECT * FROM offers LIMIT 5;
```

### 3. Test API calls

Use the admin panel to create, update, and delete offers to verify everything works.

## 🚨 Troubleshooting

### Common Issues

1. **Permission Denied**
   - Ensure RLS policies are correctly set up
   - Check your Supabase authentication

2. **Type Errors**
   - Regenerate TypeScript types: `supabase gen types typescript --local`
   - Update your database types file

3. **Missing Tables**
   - Run `supabase db push` to create missing tables
   - Check the migration files for errors

### Reset Database

If you need to start fresh:

```bash
supabase db reset
```

## 📞 Support

If you encounter issues:

1. Check the Supabase dashboard for error logs
2. Verify your environment variables
3. Ensure the database schema matches the expected structure

## 🔄 Maintenance

### Regular Tasks

1. **Backup Data**: Regularly backup your offer data
2. **Update Types**: Regenerate types after schema changes
3. **Monitor Usage**: Check offer_usage table for analytics

### Schema Updates

When updating the schema:

1. Create a new migration file
2. Test in development first
3. Update TypeScript types
4. Deploy to production

## 📈 Performance

The schema includes indexes for:

- Fast offer lookups by status
- Priority-based sorting
- Date range queries
- Usage analytics

Monitor query performance and add additional indexes as needed.
