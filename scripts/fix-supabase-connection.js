// Script to verify Supabase connection and ensure all tables exist
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Get Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verifySupabaseConnection() {
  try {
    console.log('Verifying Supabase connection...');
    
    // Try a simple query to check if the connection works
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return false;
    }
    
    console.log('Successfully connected to Supabase!');
    return true;
  } catch (error) {
    console.error('Exception in verifySupabaseConnection:', error);
    return false;
  }
}

async function createMissingTables() {
  try {
    console.log('Checking for missing tables...');
    
    // Get a list of existing tables
    const { data: existingTables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
      
    if (tableError) {
      console.error('Error checking tables:', tableError);
      return false;
    }
    
    // Extract table names
    const existingTableNames = existingTables.map(t => t.table_name);
    console.log('Existing tables:', existingTableNames);
    
    // Define required tables
    const requiredTables = [
      'users',
      'departments',
      'time_off_requests',
      'room_bookings',
      'public_holidays'
    ];
    
    // Check for missing tables
    const missingTables = requiredTables.filter(t => !existingTableNames.includes(t));
    
    if (missingTables.length === 0) {
      console.log('All required tables exist!');
      return true;
    }
    
    console.log('Missing tables:', missingTables);
    
    // Read the SQL script to create tables
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'fix-rls-policies.sql'),
      'utf8'
    );
    
    console.log('Executing SQL to create missing tables...');
    
    // Execute the SQL script
    const { error } = await supabase.rpc('exec_sql', { 
      query: sqlScript 
    });
    
    if (error) {
      console.error('Error creating tables:', error);
      return false;
    }
    
    console.log('Tables created successfully!');
    return true;
  } catch (error) {
    console.error('Exception in createMissingTables:', error);
    return false;
  }
}

async function verifyCrossDependencies() {
  try {
    console.log('Verifying cross-dependencies between tables...');
    
    // Check foreign key constraints
    const { data: foreignKeys, error: fkError } = await supabase
      .from('information_schema.table_constraints')
      .select('*')
      .eq('constraint_type', 'FOREIGN KEY')
      .eq('table_schema', 'public');
      
    if (fkError) {
      console.error('Error checking foreign key constraints:', fkError);
      return false;
    }
    
    console.log('Foreign key constraints:', foreignKeys);
    
    // Check if the users table has the department_id column
    const { data: userColumns, error: userColumnError } = await supabase
      .from('information_schema.columns')
      .select('*')
      .eq('table_name', 'users')
      .eq('table_schema', 'public');
      
    if (userColumnError) {
      console.error('Error checking user columns:', userColumnError);
      return false;
    }
    
    const hasDepartmentIdColumn = userColumns.some(c => c.column_name === 'department_id');
    console.log('Users table has department_id column:', hasDepartmentIdColumn);
    
    return true;
  } catch (error) {
    console.error('Exception in verifyCrossDependencies:', error);
    return false;
  }
}

async function checkAndFixSupabase() {
  try {
    console.log('Running Supabase health check...');
    
    // First verify the connection
    const connectionOk = await verifySupabaseConnection();
    if (!connectionOk) {
      console.error('Connection to Supabase failed. Check your credentials.');
      return false;
    }
    
    // Then check for missing tables
    const tablesOk = await createMissingTables();
    if (!tablesOk) {
      console.warn('Issues with tables. Some features may not work correctly.');
    }
    
    // Finally check cross-dependencies
    const dependenciesOk = await verifyCrossDependencies();
    if (!dependenciesOk) {
      console.warn('Issues with cross-dependencies. Some features may not work correctly.');
    }
    
    console.log('Supabase health check complete.');
    return true;
  } catch (error) {
    console.error('Exception in checkAndFixSupabase:', error);
    return false;
  }
}

// Run the check
checkAndFixSupabase().then(result => {
  if (result) {
    console.log('Supabase connection is healthy!');
  } else {
    console.error('Supabase connection has issues. See the logs for details.');
  }
}); 