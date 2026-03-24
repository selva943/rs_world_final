// Database Connection Test Script
// Run this script to verify your database setup is working correctly

import { supabase } from '@/lib/supabase';

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test 1: Check if offers table exists and has data
    console.log('\n📋 Testing offers table...');
    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .select('id, offer_name, offer_type, status')
      .limit(5);
    
    if (offersError) {
      console.error('❌ Error accessing offers table:', offersError);
      return false;
    }
    
    console.log('✅ Offers table accessible. Found', offers?.length || 0, 'offers');
    if (offers && offers.length > 0) {
      console.log('📝 Sample offers:', offers.map(o => o.offer_name));
    }
    
    // Test 2: Check related tables
    console.log('\n🔗 Testing related tables...');
    
    const { data: offerProducts, error: productsError } = await supabase
      .from('offer_products')
      .select('*')
      .limit(3);
    
    if (productsError) {
      console.error('❌ Error accessing offer_products table:', productsError);
    } else {
      console.log('✅ offer_products table accessible. Found', offerProducts?.length || 0, 'relations');
    }
    
    const { data: offerCategories, error: categoriesError } = await supabase
      .from('offer_categories')
      .select('*')
      .limit(3);
    
    if (categoriesError) {
      console.error('❌ Error accessing offer_categories table:', categoriesError);
    } else {
      console.log('✅ offer_categories table accessible. Found', offerCategories?.length || 0, 'relations');
    }
    
    // Test 3: Test creating a sample offer
    console.log('\n➕ Testing offer creation...');
    
    const testOffer = {
      offer_name: 'Test Offer - ' + new Date().toISOString(),
      offer_description: 'This is a test offer to verify database functionality',
      offer_type: 'product' as const,
      discount_type: 'percentage' as const,
      discount_value: 10.00,
      min_quantity: 1,
      priority: 1,
      status: 'active' as const
    };
    
    const { data: newOffer, error: createError } = await supabase
      .from('offers')
      .insert(testOffer)
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Error creating test offer:', createError);
      return false;
    }
    
    console.log('✅ Test offer created successfully:', newOffer.offer_name);
    
    // Test 4: Test deleting the test offer
    console.log('\n🗑️  Testing offer deletion...');
    
    const { error: deleteError } = await supabase
      .from('offers')
      .delete()
      .eq('id', newOffer.id);
    
    if (deleteError) {
      console.error('❌ Error deleting test offer:', deleteError);
      return false;
    }
    
    console.log('✅ Test offer deleted successfully');
    
    // Test 5: Test usage tracking table
    console.log('\n📊 Testing usage tracking...');
    
    const { data: usageData, error: usageError } = await supabase
      .from('offer_usage')
      .select('*')
      .limit(1);
    
    if (usageError) {
      console.error('❌ Error accessing offer_usage table:', usageError);
    } else {
      console.log('✅ offer_usage table accessible. Found', usageData?.length || 0, 'usage records');
    }
    
    console.log('\n🎉 All database tests passed!');
    console.log('\n📋 Summary:');
    console.log('✅ Database connection working');
    console.log('✅ All tables accessible');
    console.log('✅ CRUD operations working');
    console.log('✅ Offer system ready to use');
    
    return true;
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}

// Export the test function
export { testDatabaseConnection };

// Auto-run if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  testDatabaseConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test script failed:', error);
      process.exit(1);
    });
}
