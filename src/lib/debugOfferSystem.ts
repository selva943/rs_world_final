// Offer System Debug Script
// Run this to identify why offers aren't saving

import { supabase } from '@/lib/supabase';
import { offersApi } from '@/lib/services/api';

// 1. Test basic database connection
async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('offers')
      .select('count')
      .single();
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (err) {
    console.error('❌ Connection error:', err);
    return false;
  }
}

// 2. Test table structure
async function testTableStructure() {
  console.log('📋 Testing table structure...');
  
  try {
    // Check if all required columns exist
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'offers')
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (error) {
      console.error('❌ Error checking table structure:', error);
      return false;
    }
    
    const requiredColumns = [
      'id', 'offer_name', 'offer_description', 'offer_type', 
      'discount_type', 'discount_value', 'min_quantity', 
      'max_discount', 'start_date', 'end_date', 'priority', 
      'status', 'banner_image_url', 'created_at', 'updated_at'
    ];
    
    const existingColumns = columns?.map(c => c.column_name) || [];
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.error('❌ Missing columns:', missingColumns);
      return false;
    }
    
    console.log('✅ All required columns present');
    return true;
  } catch (err) {
    console.error('❌ Structure check error:', err);
    return false;
  }
}

// 3. Test offer creation with minimal data
async function testMinimalOfferCreation() {
  console.log('➕ Testing minimal offer creation...');
  
  try {
    const minimalOffer = {
      offer_name: 'Debug Test Offer ' + Date.now(),
      offer_type: 'product' as const,
      discount_type: 'percentage' as const,
      discount_value: 10.00,
      status: 'active' as const
    };
    
    console.log('📝 Creating offer with data:', minimalOffer);
    
    const { data, error } = await supabase
      .from('offers')
      .insert(minimalOffer)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Offer creation failed:', error);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      return false;
    }
    
    console.log('✅ Offer created successfully:', data.id);
    
    // Clean up test offer
    await supabase.from('offers').delete().eq('id', data.id);
    console.log('🗑️ Test offer cleaned up');
    
    return true;
  } catch (err) {
    console.error('❌ Creation test error:', err);
    return false;
  }
}

// 4. Test the offersApi service
async function testOffersApiService() {
  console.log('🔧 Testing offersApi service...');
  
  try {
    // Test getAll
    const offers = await offersApi.getAll();
    console.log('📋 Retrieved offers:', offers.length);
    
    // Test add
    const testOffer = {
      offer_name: 'API Test Offer ' + Date.now(),
      offer_type: 'product' as const,
      discount_type: 'percentage' as const,
      discount_value: 15.00,
      status: 'active' as const
    };
    
    const newOffer = await offersApi.add(testOffer);
    if (!newOffer) {
      console.error('❌ offersApi.add failed');
      return false;
    }
    
    console.log('✅ offersApi.add successful:', newOffer.id);
    
    // Test delete
    const deleted = await offersApi.delete(newOffer.id);
    if (!deleted) {
      console.error('❌ offersApi.delete failed');
      return false;
    }
    
    console.log('✅ offersApi.delete successful');
    return true;
  } catch (err) {
    console.error('❌ API service error:', err);
    return false;
  }
}

// 5. Test form data structure
async function testFormDataStructure() {
  console.log('📝 Testing form data structure...');
  
  try {
    // Simulate the exact data structure from your form
    const formData = {
      offer_name: 'Form Test Offer ' + Date.now(),
      offer_description: 'Testing form submission',
      offer_type: 'product' as const,
      discount_type: 'percentage' as const,
      discount_value: 20.00,
      min_quantity: 1,
      max_discount: null,
      start_date: new Date().toISOString(),
      end_date: null,
      priority: 100,
      status: 'active' as const,
      banner_image_url: 'https://example.com/test.jpg',
      products: ['product-1'],
      categories: [],
      combo_products: []
    };
    
    console.log('📋 Form data structure:', formData);
    
    const { data, error } = await supabase
      .from('offers')
      .insert(formData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Form data insertion failed:', error);
      return false;
    }
    
    console.log('✅ Form data insertion successful:', data.id);
    
    // Clean up
    await supabase.from('offers').delete().eq('id', data.id);
    
    return true;
  } catch (err) {
    console.error('❌ Form data test error:', err);
    return false;
  }
}

// Main debug function
export async function debugOfferSystem() {
  console.log('🚀 Starting Offer System Debug...\n');
  
  const tests = [
    { name: 'Database Connection', test: testDatabaseConnection },
    { name: 'Table Structure', test: testTableStructure },
    { name: 'Minimal Offer Creation', test: testMinimalOfferCreation },
    { name: 'Offers API Service', test: testOffersApiService },
    { name: 'Form Data Structure', test: testFormDataStructure }
  ];
  
  let allPassed = true;
  
  for (const { name, test } of tests) {
    console.log(`\n--- ${name} ---`);
    const passed = await test();
    if (!passed) {
      allPassed = false;
      console.log(`❌ ${name} FAILED`);
    } else {
      console.log(`✅ ${name} PASSED`);
    }
  }
  
  console.log('\n🎯 Debug Summary:');
  if (allPassed) {
    console.log('✅ All tests passed! The issue might be in the UI or form submission.');
  } else {
    console.log('❌ Some tests failed. Check the error messages above.');
  }
  
  return allPassed;
}

// Run this in your browser console or as part of your app
// debugOfferSystem();
