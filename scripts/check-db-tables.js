/**
 * Script to check if database tables exist in Supabase
 * 
 * This script checks for the existence of tables referenced in the error logs
 * and reports which ones need to be created.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or anon key not found in environment variables');
  console.error('Make sure you have a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Tables to check
const tablesToCheck = [
  'popular_tags',
  'content_categories',
  'community_posts',
  'post_likes',
  'post_comments',
  'subscriptions',
  'customers',
  'payment_methods',
  'invoices',
  'courses',
  'lessons',
  'user_lesson_progress',
  'user_course_progress',
  'content_tags',
  'content_notifications'
];

// Function to check if a table exists
async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      // Table doesn't exist
      return false;
    }
    
    // Table exists
    return true;
  } catch (error) {
    console.error(`Error checking table ${tableName}:`, error);
    return false;
  }
}

// Main function to check all tables
async function checkAllTables() {
  console.log('Checking database tables...');
  
  const results = {
    existing: [],
    missing: []
  };
  
  for (const table of tablesToCheck) {
    const exists = await checkTableExists(table);
    
    if (exists) {
      results.existing.push(table);
    } else {
      results.missing.push(table);
    }
  }
  
  console.log('\nResults:');
  console.log('\nExisting tables:');
  if (results.existing.length > 0) {
    results.existing.forEach(table => console.log(`- ${table}`));
  } else {
    console.log('None of the checked tables exist');
  }
  
  console.log('\nMissing tables:');
  if (results.missing.length > 0) {
    results.missing.forEach(table => console.log(`- ${table}`));
  } else {
    console.log('All checked tables exist');
  }
  
  console.log('\nTo create the missing tables, run the apply-db-schemas.js script.');
}

// Run the script
checkAllTables().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
