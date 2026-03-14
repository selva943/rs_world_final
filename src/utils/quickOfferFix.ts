// Quick Fix for Offer Creation
// This will help identify and fix the issue

import { supabase } from '../lib/supabase';

// Test 1: Direct database insertion
export async function testDirectOfferInsertion() {
  console.log('🔧 Testing direct database insertion...');
  
  const testOffer = {
    offer_name: 'Direct Test Offer ' + Date.now(),
    offer_description: 'Testing direct insertion',
    offer_type: 'product',
    discount_type: 'percentage',
    discount_value: 10.00,
    min_quantity: 1,
    max_discount: null,
    start_date: new Date().toISOString(),
    end_date: null,
    priority: 100,
    status: 'active',
    banner_image_url: null
  };
  
  try {
    console.log('📝 Inserting offer:', testOffer);
    
    const { data, error } = await supabase
      .from('offers')
      .insert(testOffer)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Direct insertion failed:', error);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      return false;
    }
    
    console.log('✅ Direct insertion successful:', data);
    
    // Clean up
    await supabase.from('offers').delete().eq('id', data.id);
    console.log('🗑️ Test offer cleaned up');
    
    return true;
  } catch (err) {
    console.error('❌ Direct insertion error:', err);
    return false;
  }
}

// Test 2: Check if the issue is with the API service
export async function testApiServiceOfferCreation() {
  console.log('🔧 Testing API service offer creation...');
  
  try {
    // Import the API service
    const { offersApi } = await import('../services/api');
    
    const testOffer = {
      offer_name: 'API Test Offer ' + Date.now(),
      offer_description: 'Testing API service',
      offer_type: 'product' as const,
      discount_type: 'percentage' as const,
      discount_value: 15.00,
      min_quantity: 1,
      max_discount: null,
      start_date: new Date().toISOString(),
      end_date: null,
      priority: 80,
      status: 'active' as const,
      banner_image_url: null,
      products: [],
      categories: [],
      combo_products: []
    };
    
    console.log('📝 Creating offer via API:', testOffer);
    
    const result = await offersApi.add(testOffer);
    
    if (!result) {
      console.error('❌ API service creation failed');
      return false;
    }
    
    console.log('✅ API service creation successful:', result);
    
    // Clean up
    await offersApi.delete(result.id);
    console.log('🗑️ Test offer cleaned up');
    
    return true;
  } catch (err) {
    console.error('❌ API service error:', err);
    return false;
  }
}

// Test 3: Simulate exact form submission
export async function testFormSubmission() {
  console.log('🔧 Testing exact form submission...');
  
  try {
    // This simulates exactly what your form should be sending
    const formData = {
      offer_name: 'Form Test Offer ' + Date.now(),
      offer_description: '',
      offer_type: 'product' as const,
      discount_type: 'percentage' as const,
      discount_value: 20.00,
      min_quantity: 1,
      max_discount: undefined,
      start_date: new Date().toISOString(),
      end_date: '',
      priority: 0,
      status: 'active' as const,
      banner_image_url: '',
      products: [],
      categories: [],
      combo_products: []
    };
    
    console.log('📝 Form data:', formData);
    
    // Clean up the data like the API service does
    const offerData = {
      offer_name: formData.offer_name,
      offer_description: formData.offer_description || null,
      offer_type: formData.offer_type,
      discount_type: formData.discount_type,
      discount_value: formData.discount_value,
      min_quantity: formData.min_quantity,
      max_discount: formData.max_discount || null,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      priority: formData.priority,
      status: formData.status,
      banner_image_url: formData.banner_image_url || null,
      updated_at: new Date().toISOString(),
    };
    
    console.log('📝 Cleaned data:', offerData);
    
    const { data, error } = await supabase
      .from('offers')
      .insert(offerData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Form submission failed:', error);
      return false;
    }
    
    console.log('✅ Form submission successful:', data);
    
    // Clean up
    await supabase.from('offers').delete().eq('id', data.id);
    
    return true;
  } catch (err) {
    console.error('❌ Form submission error:', err);
    return false;
  }
}

// Quick diagnostic function
export async function quickOfferDiagnosis() {
  console.log('🚀 Quick Offer Diagnosis...\n');
  
  const tests = [
    { name: 'Direct Database Insertion', test: testDirectOfferInsertion },
    { name: 'API Service Creation', test: testApiServiceOfferCreation },
    { name: 'Form Submission', test: testFormSubmission }
  ];
  
  for (const { name, test } of tests) {
    console.log(`\n--- ${name} ---`);
    const passed = await test();
    console.log(passed ? `✅ ${name} PASSED` : `❌ ${name} FAILED`);
  }
  
  console.log('\n🎯 If all tests pass, the issue is likely in the UI form handling.');
  console.log('🎯 If tests fail, check the database schema and permissions.');
}

// Run this in browser console:
// quickOfferDiagnosis();
