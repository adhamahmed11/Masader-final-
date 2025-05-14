// Script to create necessary tables in Supabase
// Usage: node scripts/create-tables.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from .env file
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Create tables
async function createTables() {
  try {
    console.log('Creating necessary tables in Supabase...');

    // Create departments table
    console.log('Creating departments table...');
    await supabase.rpc('create_departments_table_if_not_exists', {});
    
    // Create time_off_requests table
    console.log('Creating time_off_requests table...');
    await supabase.rpc('create_time_off_requests_table_if_not_exists', {});
    
    // Create room_bookings table
    console.log('Creating room_bookings table...');
    await supabase.rpc('create_room_bookings_table_if_not_exists', {});
    
    // Create public_holidays table
    console.log('Creating public_holidays table...');
    await supabase.rpc('create_public_holidays_table_if_not_exists', {});
    
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Create initial data
async function createInitialData() {
  try {
    console.log('Creating initial data...');
    
    // Create default departments if none exist
    const { data: existingDepartments } = await supabase
      .from('departments')
      .select('id')
      .limit(1);
      
    if (!existingDepartments || existingDepartments.length === 0) {
      console.log('Creating default departments...');
      const defaultDepartments = [
        { id: 'env-eng', name: 'Environmental Engineering', admin_email: null },
        { id: 'green-bldg', name: 'Green Building', admin_email: null },
        { id: 'carbon', name: 'Carbon', admin_email: null },
        { id: 'esg', name: 'ESG', admin_email: null }
      ];
      
      await supabase.from('departments').insert(defaultDepartments);
      console.log('Default departments created');
    } else {
      console.log('Departments already exist');
    }
  } catch (error) {
    console.error('Error creating initial data:', error);
  }
}

// Run the script
async function main() {
  await createTables();
  await createInitialData();
  
  console.log('Done!');
  process.exit(0);
}

main(); 