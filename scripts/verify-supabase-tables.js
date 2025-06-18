// scripts/verify-supabase-tables.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  console.error('\nYou can create a .env file in the root directory with:');
  console.error('VITE_SUPABASE_URL=your_supabase_url');
  console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyTable(tableName, description = '') {
  console.log(`\n🔍 Checking ${tableName}${description ? ` (${description})` : ''}...`);
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(10);
    
    if (error) {
      console.error(`❌ Error fetching ${tableName}:`, error.message);
      return false;
    }
    
    console.log(`✅ ${tableName}: ${data.length} rows found`);
    
    if (data.length > 0) {
      console.log('📊 Sample data:');
      console.table(data.slice(0, 3)); // Show first 3 rows
    } else {
      console.log('📭 Table is empty');
    }
    
    return true;
  } catch (err) {
    console.error(`❌ Unexpected error with ${tableName}:`, err.message);
    return false;
  }
}

async function verifyAuth() {
  console.log('\n🔐 Checking authentication...');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('ℹ️  No authenticated user (this is normal for verification)');
    } else if (user) {
      console.log(`✅ Authenticated as: ${user.email}`);
    }
    
    return true;
  } catch (err) {
    console.error('❌ Auth check failed:', err.message);
    return false;
  }
}

async function verifyConnection() {
  console.log('\n🌐 Testing Supabase connection...');
  
  try {
    // Simple query to test connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase');
    return true;
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Supabase table verification...\n');
  
  // Check connection first
  const connectionOk = await verifyConnection();
  if (!connectionOk) {
    console.error('❌ Failed to connect to Supabase');
    process.exit(1);
  }
  
  // Check auth
  await verifyAuth();
  
  // Define tables to check (add/remove as needed)
  const tables = [
    { name: 'users', description: 'User accounts' },
    { name: 'profiles', description: 'User profiles' },
    { name: 'community_posts', description: 'Community posts' },
    { name: 'comments', description: 'Post comments' },
    { name: 'subscriptions', description: 'User subscriptions' },
    { name: 'content_categories', description: 'Content categories' },
    { name: 'beta_requests', description: 'Beta access requests' },
    { name: 'beta_feedback', description: 'Beta feedback' },
    { name: 'search_view', description: 'Search view' },
    { name: 'popular_tags', description: 'Popular tags' },
  ];
  
  let successCount = 0;
  let totalCount = tables.length;
  
  for (const table of tables) {
    const success = await verifyTable(table.name, table.description);
    if (success) successCount++;
  }
  
  console.log('\n📋 Verification Summary:');
  console.log(`✅ Successful: ${successCount}/${totalCount} tables`);
  console.log(`❌ Failed: ${totalCount - successCount}/${totalCount} tables`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 All tables verified successfully!');
    console.log('\n💡 Next steps:');
    console.log('1. Check your app is using the real API (not mock)');
    console.log('2. Test user registration and login');
    console.log('3. Verify data flows in the UI');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tables failed verification. Check the errors above.');
    console.log('\n💡 Troubleshooting:');
    console.log('1. Verify your Supabase URL and keys are correct');
    console.log('2. Check if tables exist in your Supabase dashboard');
    console.log('3. Ensure RLS policies allow anonymous access for verification');
    process.exit(1);
  }
}

// Handle errors gracefully
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 