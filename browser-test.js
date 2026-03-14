// Simple Offer Creation Test
// Copy and paste this into your browser console to test offer creation

async function testOfferCreation() {
  console.log('🔧 Testing offer creation...');
  
  try {
    // Test data - minimal required fields
    const offerData = {
      offer_name: 'Test Offer ' + Date.now(),
      offer_description: 'Test description',
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
    
    console.log('📝 Creating offer:', offerData);
    
    // Direct Supabase call - bypass TypeScript types
    const { data, error } = await supabase
      .from('offers')
      .insert(offerData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error:', error);
      console.error('Details:', error.details);
      console.error('Hint:', error.hint);
      return false;
    }
    
    console.log('✅ Success! Created offer:', data);
    
    // Clean up
    await supabase.from('offers').delete().eq('id', data.id);
    console.log('🗑️ Cleaned up test offer');
    
    return true;
  } catch (err) {
    console.error('❌ Exception:', err);
    return false;
  }
}

// Run the test
testOfferCreation().then(success => {
  console.log(success ? '✅ Test passed!' : '❌ Test failed!');
});

// Also test what columns exist
async function checkTableStructure() {
  console.log('🔍 Checking table structure...');
  
  const { data, error } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type')
    .eq('table_name', 'offers')
    .eq('table_schema', 'public')
    .order('ordinal_position');
  
  if (error) {
    console.error('❌ Error checking structure:', error);
    return;
  }
  
  console.log('📋 Columns in offers table:');
  data?.forEach(col => {
    console.log(`  - ${col.column_name}: ${col.data_type}`);
  });
}

// Check structure
checkTableStructure();
