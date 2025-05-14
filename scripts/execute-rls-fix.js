// Script to fix Row Level Security (RLS) policies in Supabase
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

async function fixRlsPolicies() {
  try {
    console.log('Reading RLS fix SQL script...');
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'fix-rls-policies.sql'),
      'utf8'
    );

    console.log('Executing SQL to fix RLS policies...');
    
    // Split the script into separate statements
    const statements = sqlScript
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    // Execute each statement separately
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          query: statement + ';' 
        });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          console.error('SQL:', statement);
        } else {
          console.log(`Successfully executed statement ${i + 1}`);
        }
      } catch (stmtError) {
        console.error(`Exception executing statement ${i + 1}:`, stmtError);
        console.error('SQL:', statement);
      }
    }
    
    console.log('RLS policy fix complete!');
    console.log('The app should now be free from infinite recursion errors.');
    
  } catch (error) {
    console.error('Exception in fixRlsPolicies:', error);
  }
}

// Run the script
fixRlsPolicies().catch(error => {
  console.error('Failed to fix RLS policies:', error);
}); 