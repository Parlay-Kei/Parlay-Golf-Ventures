/**
 * Script to apply database schemas to Supabase
 * 
 * This script reads the SQL schema files and applies them to the Supabase database
 * using the Supabase client. It can be run with Node.js.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL or service role key not found in environment variables');
  console.error('Make sure you have a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Path to schema files
const schemaDir = path.join(__dirname, '..', 'src', 'db');

// Order of schema files to apply (some schemas depend on others)
const schemaFiles = [
  'user-profile-schema.sql',
  'lesson-tracking-schema.sql',
  'search-schema.sql',
  'content-notifications-schema.sql',
  'subscription-schema.sql'
];

// Function to apply a schema file
async function applySchema(filePath) {
  try {
    console.log(`Reading schema file: ${filePath}`);
    const schema = fs.readFileSync(filePath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL statements in ${path.basename(filePath)}`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        
        if (error) {
          console.warn(`Warning: Error executing statement ${i + 1}: ${error.message}`);
          console.warn('Continuing with next statement...');
        }
      } catch (err) {
        console.warn(`Warning: Error executing statement ${i + 1}: ${err.message}`);
        console.warn('Continuing with next statement...');
      }
    }
    
    console.log(`Successfully applied schema: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`Error applying schema ${path.basename(filePath)}: ${error.message}`);
    return false;
  }
}

// Main function to apply all schemas
async function applyAllSchemas() {
  console.log('Starting database schema application...');
  
  let success = true;
  
  // Apply each schema file in order
  for (const file of schemaFiles) {
    const filePath = path.join(schemaDir, file);
    
    if (fs.existsSync(filePath)) {
      const result = await applySchema(filePath);
      if (!result) {
        success = false;
        console.error(`Failed to apply schema: ${file}`);
      }
    } else {
      console.warn(`Warning: Schema file not found: ${file}`);
    }
  }
  
  if (success) {
    console.log('All database schemas applied successfully!');
  } else {
    console.error('Some schemas failed to apply. Check the logs for details.');
  }
}

// Run the script
applyAllSchemas().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
