// Comprehensive Offer System Diagnostic
// Run this in browser console to identify the exact problem

async function comprehensiveOfferDiagnostic() {
  console.log('🚀 COMPREHENSIVE OFFER SYSTEM DIAGNOSTIC\n');
  
  // 1. Check Supabase connection
  console.log('--- 1. CHECKING SUPABASE CONNECTION ---');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Supabase auth error:', error);
    } else {
      console.log('✅ Supabase connection OK');
    }
  } catch (err) {
    console.error('❌ Supabase connection failed:', err);
  }
  
  // 2. Check if offers table exists
  console.log('\n--- 2. CHECKING OFFERS TABLE ---');
  try {
    const { data, error } = await supabase
      .from('offers')
      .select('count')
      .single();
    
    if (error) {
      console.error('❌ Offers table error:', error);
      console.error('This likely means the table doesn\'t exist or has wrong columns');
    } else {
      console.log('✅ Offers table exists, count:', data.count);
    }
  } catch (err) {
    console.error('❌ Offers table check failed:', err);
  }
  
  // 3. Check table structure in detail
  console.log('\n--- 3. DETAILED TABLE STRUCTURE ---');
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'offers')
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (error) {
      console.error('❌ Cannot check table structure:', error);
    } else {
      console.log('📋 Table columns:');
      data?.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable ? 'nullable' : 'required'})`);
      });
      
      // Check for required columns
      const requiredColumns = ['offer_name', 'offer_type', 'discount_type', 'discount_value'];
      const existingColumns = data?.map(c => c.column_name) || [];
      const missing = requiredColumns.filter(col => !existingColumns.includes(col));
      
      if (missing.length > 0) {
        console.error('❌ MISSING REQUIRED COLUMNS:', missing);
      } else {
        console.log('✅ All required columns present');
      }
    }
  } catch (err) {
    console.error('❌ Structure check failed:', err);
  }
  
  // 4. Test minimal insertion
  console.log('\n--- 4. TESTING MINIMAL INSERTION ---');
  try {
    const minimalOffer = {
      offer_name: 'Minimal Test ' + Date.now(),
      offer_type: 'product',
      discount_type: 'percentage',
      discount_value: 10.00
    };
    
    console.log('📝 Trying minimal insert:', minimalOffer);
    
    const { data, error } = await supabase
      .from('offers')
      .insert(minimalOffer)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Minimal insert failed:', error);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      
      // Provide specific fixes based on error
      if (error.code === 'PGRST116') {
        console.log('💡 FIX: Table doesn\'t exist - run the schema migration');
      } else if (error.code === '42703') {
        console.log('💡 FIX: Column doesn\'t exist - run fix-database-schema.sql');
      } else if (error.code === '23514') {
        console.log('💡 FIX: Constraint violation - check required fields');
      }
    } else {
      console.log('✅ Minimal insert successful:', data);
      
      // Clean up
      await supabase.from('offers').delete().eq('id', data.id);
      console.log('🗑️ Test data cleaned up');
    }
  } catch (err) {
    console.error('❌ Minimal insert exception:', err);
  }
  
  // 5. Test full insertion with all fields
  console.log('\n--- 5. TESTING FULL INSERTION ---');
  try {
    const fullOffer = {
      offer_name: 'Full Test ' + Date.now(),
      offer_description: 'Complete test offer',
      offer_type: 'product',
      discount_type: 'percentage',
      discount_value: 15.00,
      min_quantity: 1,
      max_discount: null,
      start_date: new Date().toISOString(),
      end_date: null,
      priority: 100,
      status: 'active',
      banner_image_url: null
    };
    
    console.log('📝 Trying full insert:', fullOffer);
    
    const { data, error } = await supabase
      .from('offers')
      .insert(fullOffer)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Full insert failed:', error);
    } else {
      console.log('✅ Full insert successful:', data);
      
      // Clean up
      await supabase.from('offers').delete().eq('id', data.id);
      console.log('🗑️ Test data cleaned up');
    }
  } catch (err) {
    console.error('❌ Full insert exception:', err);
  }
  
  // 6. Check RLS policies
  console.log('\n--- 6. CHECKING RLS POLICIES ---');
  try {
    const { data, error } = await supabase
      .from('pg_policies')
      .select('policyname, permissive, roles, cmd, qual')
      .eq('tablename', 'offers');
    
    if (error) {
      console.log('ℹ️ Cannot check RLS (might be normal)');
    } else {
      console.log('📋 RLS Policies:', data);
    }
  } catch (err) {
    console.log('ℹ️ RLS check failed (might be normal)');
  }
  
  console.log('\n🎯 DIAGNOSTIC COMPLETE');
  console.log('📋 NEXT STEPS:');
  console.log('1. If table doesn\'t exist: Run supabase-migrations.sql');
  console.log('2. If columns missing: Run fix-database-schema.sql');
  console.log('3. If RLS issues: Check policies in Supabase dashboard');
  console.log('4. If inserts work: Issue is in the UI form code');
}

// Run the diagnostic
comprehensiveOfferDiagnostic();
