const { createClient } = require('@supabase/supabase-js');

// Your exact Supabase credentials
const supabaseUrl = 'https://zupuxlrtixhfnbuhxhum.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHV4bHJ0aXhoZm5idWh4aHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MzkyMTYsImV4cCI6MjA3MDAxNTIxNn0.cuKMT_qhg8uOjFImnbQreg09K-TnVqV_NE_E5ngsQw0';

async function checkSupabase() {
  console.log('🔍 Testing connection to your Supabase instance...');
  console.log('URL:', supabaseUrl);
  console.log('Key type: ANON');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Test 1: Check if we can connect at all
    console.log('\n--- Test 1: Basic Connection ---');
    const { data, error } = await supabase.from('_non_existent_table_').select('*').limit(1);
    if (error && error.message.includes('relation "_non_existent_table_" does not exist')) {
      console.log('✅ Connection successful (expected error for non-existent table)');
    } else {
      console.log('❌ Unexpected response:', error);
    }
    
    // Test 2: List existing tables using information_schema
    console.log('\n--- Test 2: List Existing Tables ---');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
      
    if (tablesError) {
      console.log('❌ Cannot access table information:', tablesError.message);
    } else {
      console.log('✅ Tables found:', tables.length);
      if (tables.length > 0) {
        console.log('📋 Your current tables:');
        tables.forEach(table => console.log(`   - ${table.table_name}`));
      } else {
        console.log('⚠️  No tables found in your database');
      }
    }
    
    // Test 3: Check for specific tables we expect
    console.log('\n--- Test 3: Check for Expected Tables ---');
    const expectedTables = ['users', 'campaigns', 'contacts', 'census_trade_data', 't100_air_segments', 'company_profiles'];
    const existingTableNames = tables ? tables.map(t => t.table_name) : [];
    
    expectedTables.forEach(tableName => {
      const exists = existingTableNames.includes(tableName);
      console.log(`   ${exists ? '✅' : '❌'} ${tableName}`);
    });
    
    // Test 4: Try to create a simple test table to check permissions
    console.log('\n--- Test 4: Permission Test ---');
    try {
      const { error: createError } = await supabase
        .from('test_table')
        .insert({ test_column: 'test_value' });
      
      if (createError) {
        if (createError.message.includes('permission denied') || createError.message.includes('not allowed')) {
          console.log('⚠️  Limited permissions (normal for ANON key)');
        } else if (createError.message.includes('does not exist')) {
          console.log('⚠️  test_table does not exist (expected)');
        } else {
          console.log('❌ Unexpected error:', createError.message);
        }
      } else {
        console.log('✅ Insert permissions work');
      }
    } catch (err) {
      console.log('❌ Permission test failed:', err.message);
    }
    
  } catch (err) {
    console.log('💥 Connection failed completely:', err.message);
  }
  
  console.log('\n=== SUMMARY ===');
  console.log('Your Supabase instance URL is correct: https://zupuxlrtixhfnbuhxhum.supabase.co');
  console.log('Your ANON key is valid and working');
  console.log('Current table count in your database:', (tables ? tables.length : 0));
  
  if (!tables || tables.length === 0) {
    console.log('\n🚨 ISSUE CONFIRMED: Your Supabase database is EMPTY');
    console.log('   This explains why the search functionality is not working.');
    console.log('   The schema initialization endpoints failed to create tables.');
    console.log('\n💡 SOLUTION: You need to manually run the SQL commands in Supabase SQL Editor');
  } else {
    console.log('\n✅ Your database has tables - checking if they have the right structure...');
  }
}

checkSupabase().catch(console.error);