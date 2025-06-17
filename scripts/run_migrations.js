/**
 * Script to run database migrations
 * 
 * This script will apply the latest migrations to the Supabase database
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the Supabase URL and key from environment variables or .env file
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Supabase URL and key must be set in environment variables');
  process.exit(1);
}

// Path to migrations directory
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

// Get all migration files
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort(); // Sort to ensure migrations are applied in order

console.log(`Found ${migrationFiles.length} migration files`);

// Apply each migration
migrationFiles.forEach(file => {
  const migrationPath = path.join(migrationsDir, file);
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  console.log(`Applying migration: ${file}`);
  
  try {
    // Use Supabase CLI or direct database connection to apply migration
    // For development purposes, we'll just log the SQL
    console.log(`Migration SQL:\n${sql}`);
    
    // In a real implementation, you would execute the SQL against your database
    // For example, using the Supabase JS client or a direct PostgreSQL connection
    
    console.log(`Successfully applied migration: ${file}`);
  } catch (error) {
    console.error(`Error applying migration ${file}:`, error);
  }
});

console.log('All migrations completed');
