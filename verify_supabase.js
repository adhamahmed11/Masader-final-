import { createClient } from '@supabase/supabase-js';

// Read the arguments from command line
const supabaseUrl = process.argv[2];
const supabaseKey = process.argv[3];

if (!supabaseUrl || !supabaseKey) {
  console.error('Usage: node verify_supabase.js <supabase_url> <supabase_key>');
  process.exit(1);
}

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    
    // Check if we can connect at all
    const { data: healthCheck, error: healthError } = await supabase.from('_dummy_query_for_connection_test_').select('*').limit(1).catch(e => {
      // This query will fail, but we just want to check if we can reach Supabase
      return { data: null, error: e };
    });

    if (healthError && healthError.code !== 'PGRST116') {
      // We expect a "relation does not exist" error (PGRST116), anything else is a problem
      console.error('Error connecting to Supabase:', healthError);
      return false;
    }
    
    console.log('Connection to Supabase successful');
    
    // Check if departments table exists
    console.log('Checking for departments table...');
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
      
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return false;
    }
    
    const tableNames = tables ? tables.map(t => t.tablename) : [];
    console.log('Tables in public schema:', tableNames);
    
    if (!tableNames.includes('departments')) {
      console.error('The departments table does not exist in the database.');
      return false;
    }
    
    // Check if departments table has data
    console.log('Checking departments data...');
    const { data: departments, error: deptsError } = await supabase
      .from('departments')
      .select('*');
      
    if (deptsError) {
      console.error('Error fetching departments:', deptsError);
      return false;
    }
    
    if (!departments || departments.length === 0) {
      console.warn('The departments table exists but has no data.');
    } else {
      console.log('Departments found:', departments);
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error during Supabase check:', error);
    return false;
  }
}

// Execute the check
checkSupabaseConnection().then(success => {
  if (success) {
    console.log('✅ Supabase connection verification completed successfully.');
  } else {
    console.error('❌ Supabase connection verification failed.');
  }
}); 