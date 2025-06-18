// verify-supabase-tables.js
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyTable(table) {
  const { data, error } = await supabase.from(table).select('*').limit(10);
  if (error) {
    console.error(`❌ Error fetching ${table}:`, error.message);
  } else {
    console.log(`✅ ${table} (${data.length} rows):`);
    console.table(data);
  }
}

async function main() {
  const tables = [
    'users',
    'profiles',
    'community_posts',
    'comments',
    'subscriptions',
    'content_categories',
    // Add more table names as needed
  ];

  for (const table of tables) {
    await verifyTable(table);
  }
  process.exit(0);
}

main();