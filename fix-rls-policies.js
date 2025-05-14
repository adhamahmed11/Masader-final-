// Fix for Supabase RLS policies causing infinite recursion
// Run with: node fix-rls-policies.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory and env configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();

// Get environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate credentials
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Error: Missing Supabase credentials. Please create a .env file with:');
  console.error('VITE_SUPABASE_URL=your_supabase_url');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

// Create a Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// SQL statements to fix RLS policies
const sqlStatements = [
  // Disable RLS temporarily
  `ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;`,
  
  // Drop existing policies (may have recursion issues)
  `DROP POLICY IF EXISTS "Users can view their own data" ON public.users;`,
  `DROP POLICY IF EXISTS "Admins can view all user data" ON public.users;`,
  `DROP POLICY IF EXISTS "Users can update their own data" ON public.users;`,
  `DROP POLICY IF EXISTS "Admins can update all user data" ON public.users;`,
  `DROP POLICY IF EXISTS "Department admins can view their department's users" ON public.users;`,
  `DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;`,
  `DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;`,
  `DROP POLICY IF EXISTS "Users can insert own record" ON public.users;`,
  `DROP POLICY IF EXISTS "Public insert access" ON public.users;`,
  `DROP POLICY IF EXISTS "Users can view and update their own data" ON public.users;`,
  `DROP POLICY IF EXISTS "Admins have full access" ON public.users;`,
  
  // Create simple non-recursive policies (using auth.uid() directly without nested queries)
  `CREATE POLICY "Public read access" ON public.users FOR SELECT USING (true);`,
  `CREATE POLICY "Users update own data" ON public.users FOR UPDATE USING (auth.uid() = id);`,
  `CREATE POLICY "Users insert own data" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);`,
  
  // Re-enable RLS
  `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;`
];

async function executeSQL(sql) {
  try {
    console.log(`Executing: ${sql}`);
    
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      return false;
    }
    
    console.log('Successfully executed');
    return true;
  } catch (error) {
    console.error('Exception executing SQL:', error);
    return false;
  }
}

// Check if exec_sql function exists and create it if needed
async function setupExecSQLFunction() {
  const createFunctionSQL = `
  CREATE OR REPLACE FUNCTION exec_sql(query text)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  BEGIN
    EXECUTE query;
  END;
  $$;
  `;

  try {
    console.log('Setting up exec_sql function...');
    
    try {
      // Try using the function (will fail if it doesn't exist)
      const { error } = await supabase.rpc('exec_sql', { query: 'SELECT 1;' });
      
      if (!error) {
        console.log('exec_sql function already exists');
        return true;
      }
    } catch (e) {
      console.log('exec_sql function does not exist, creating it...');
    }
    
    // Create the function using SQL
    const { error } = await supabase.sql(createFunctionSQL);
    
    if (error) {
      console.error('Failed to create exec_sql function.');
      console.error('Please go to the Supabase SQL Editor and execute this query:');
      console.error(createFunctionSQL);
      return false;
    }
    
    console.log('Successfully set up exec_sql function');
    return true;
  } catch (error) {
    console.error('Error setting up exec_sql function:', error);
    console.error('Please manually create the function in SQL Editor with:');
    console.error(createFunctionSQL);
    return false;
  }
}

async function fixRLSPolicies() {
  console.log('Fixing RLS policies to resolve infinite recursion...');
  
  // First try to set up the exec_sql function
  const setupSuccess = await setupExecSQLFunction();
  if (!setupSuccess) {
    console.error('Failed to set up exec_sql function. Please create it manually and try again.');
    return;
  }
  
  // Execute each SQL statement separately
  for (const sql of sqlStatements) {
    const success = await executeSQL(sql);
    if (!success) {
      console.error('Failed to execute:', sql);
    }
  }
  
  console.log('RLS policy fix completed');
}

// Run the script
fixRLSPolicies()
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err)); 