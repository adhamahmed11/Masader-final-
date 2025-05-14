// Fix for Supabase RLS policies causing infinite recursion - direct version
// Run with: node fix-direct.js

import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials for this script only (remove after use)
const SUPABASE_URL = 'https://vxqvwfhzodknwmpnekzu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cXZ3Zmh6b2RrbndtcG5la3p1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzE4NzkzMiwiZXhwIjoyMDYyNzYzOTMyfQ.53LH3jrQwk0YOIAP74WPZHkChvEU2vPVN-kA5YJ7lA8';

// Create a Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Simple function to execute SQL using supabase.sql
async function executeSQL(sql) {
  try {
    console.log(`Executing: ${sql}`);
    const { error } = await supabase.sql(sql);
    
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

async function fixRLS() {
  console.log('Fixing infinite recursion in RLS policies...');
  
  // Execute SQL statements one by one
  const statements = [
    // Disable RLS temporarily to make changes
    `ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;`,
    
    // Drop all existing policies that might cause recursion
    `DROP POLICY IF EXISTS "Users can view their own data" ON public.users;`,
    `DROP POLICY IF EXISTS "Admins can view all user data" ON public.users;`,
    `DROP POLICY IF EXISTS "Users can update their own data" ON public.users;`,
    `DROP POLICY IF EXISTS "Admins can update all user data" ON public.users;`,
    `DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;`,
    `DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;`,
    `DROP POLICY IF EXISTS "Users can insert own record" ON public.users;`,
    `DROP POLICY IF EXISTS "Public insert access" ON public.users;`,
    `DROP POLICY IF EXISTS "Users can view and update their own data" ON public.users;`,
    `DROP POLICY IF EXISTS "Admins have full access" ON public.users;`,
    `DROP POLICY IF EXISTS "Department admins can view their department's users" ON public.users;`,
    
    // Create simple policies that won't cause recursion
    `CREATE POLICY "Everyone can read users" ON public.users FOR SELECT USING (true);`,
    `CREATE POLICY "Users can update themselves" ON public.users FOR UPDATE USING (auth.uid() = id);`,
    `CREATE POLICY "New users can register" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);`,
    
    // Re-enable RLS
    `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;`
  ];
  
  for (const sql of statements) {
    const success = await executeSQL(sql);
    if (!success) {
      console.error('Failed to execute:', sql);
    }
  }
  
  console.log('RLS fix complete!');
}

// Run the fix
fixRLS()
  .then(() => console.log('Script finished'))
  .catch(err => console.error('Script failed:', err)); 