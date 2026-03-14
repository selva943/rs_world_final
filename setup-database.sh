#!/bin/bash

# Database Setup Script for Offer System
# This script helps set up the database schema for the new offer feature

echo "🚀 Setting up Offer System Database Schema..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if user is logged in to Supabase
if ! supabase status &> /dev/null; then
    echo "❌ Please login to Supabase first:"
    echo "supabase login"
    exit 1
fi

echo "📋 Creating database schema..."

# Run the migration
if supabase db push; then
    echo "✅ Database schema created successfully!"
else
    echo "❌ Failed to create database schema"
    exit 1
fi

echo "🌐 Generating TypeScript types..."

# Generate TypeScript types
if supabase gen types typescript --local > src/types/supabase.ts; then
    echo "✅ TypeScript types generated successfully!"
else
    echo "⚠️  Failed to generate TypeScript types (this is optional)"
fi

echo "🎉 Database setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update your .env file with the correct Supabase URL and anon key"
echo "2. Restart your development server"
echo "3. Test the offer system in the admin panel"
echo ""
echo "🔗 Useful commands:"
echo "- supabase db push: Push schema changes to database"
echo "- supabase db reset: Reset database to initial state"
echo "- supabase gen types typescript: Regenerate TypeScript types"
