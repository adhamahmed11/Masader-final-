// Script to seed Egyptian public holidays into the database
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

async function seedHolidays() {
  try {
    console.log('Reading seed SQL script...');
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'seed-egyptian-holidays.sql'),
      'utf8'
    );

    console.log('Executing SQL to seed Egyptian public holidays...');
    
    // Create exec_sql function if it doesn't exist
    await supabase.rpc('exec_sql', {
      query: `
      CREATE OR REPLACE FUNCTION exec_sql(query text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE query;
      END;
      $$;
      `
    }).catch(error => {
      console.log('Note: exec_sql function may already exist:', error.message);
    });
    
    // Execute the SQL script
    const { error } = await supabase.rpc('exec_sql', { query: sqlScript });
    
    if (error) {
      console.error('Error seeding holidays:', error);
      return;
    }
    
    // Check if holidays were inserted by fetching a few
    const { data, error: fetchError } = await supabase
      .from('public_holidays')
      .select('id, name, date')
      .limit(5);
      
    if (fetchError) {
      console.error('Error checking seeded holidays:', fetchError);
      return;
    }
    
    if (!data || data.length === 0) {
      console.warn('No holidays found after seeding. Check for errors.');
    } else {
      console.log(`Successfully seeded holidays! Sample: ${data.map(h => h.name).join(', ')}...`);
      console.log(`These holidays will now appear in the calendar.`);
    }
  } catch (error) {
    console.error('Exception in seedHolidays:', error);
  }
}

// Run the script
seedHolidays().catch(error => {
  console.error('Failed to seed holidays:', error);
}); 