const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file if present
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// We need the service role key to modify RLS policies
if (!serviceRoleKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('Please add it to your .env file or environment variables');
  process.exit(1);
}

if (!supabaseUrl) {
  console.error('Error: VITE_SUPABASE_URL environment variable is required');
  console.error('Please add it to your .env file or environment variables');
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function applyFix() {
  try {
    console.log('Reading SQL fix script...');
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'fix-user-policies.sql'),
      'utf8'
    );

    console.log('Applying fix for infinite recursion in users table policies...');
    
    // Split the SQL script into individual statements and execute them sequentially
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 60)}...`);
      const { error } = await supabase.rpc('exec_sql', { 
        query: statement + ';' 
      });
      
      if (error) {
        console.error('Error executing statement:', error);
        console.error('Statement:', statement);
      }
    }

    console.log('✅ Fix applied successfully!');
    console.log('The infinite recursion in users table policies has been resolved.');
  } catch (error) {
    console.error('Failed to apply fix:', error);
  }
}

// Run the fix
applyFix().catch(console.error); 