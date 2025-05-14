// Script to seed departments into the Supabase database
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Get Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey);

// Default departments to seed
const defaultDepartments = [
  { name: 'Environmental Engineering', id: 'env-eng' },
  { name: 'Green Building', id: 'green-bldg' },
  { name: 'Carbon', id: 'carbon' },
  { name: 'ESG', id: 'esg' },
  { name: 'HR', id: 'hr' },
  { name: 'IT', id: 'it' },
  { name: 'Finance', id: 'finance' },
  { name: 'Marketing', id: 'marketing' },
  { name: 'Operations', id: 'operations' }
];

async function seedDepartments() {
  try {
    console.log('Checking existing departments...');
    
    // Check if departments already exist
    const { data: existingDepts, error: checkError } = await supabase
      .from('departments')
      .select('id')
      .limit(1);
      
    if (checkError) {
      console.error('Error checking departments:', checkError);
      return false;
    }
    
    // If departments exist, don't add more
    if (existingDepts && existingDepts.length > 0) {
      console.log('Departments already exist in the database. Skipping seeding.');
      
      // Show existing departments
      const { data: allDepts, error: listError } = await supabase
        .from('departments')
        .select('*')
        .order('name');
        
      if (listError) {
        console.error('Error listing departments:', listError);
      } else {
        console.log('Existing departments:');
        console.table(allDepts);
      }
      
      return true;
    }
    
    console.log('No departments found. Adding default departments...');
    
    // Add departments one by one to handle potential errors
    for (const dept of defaultDepartments) {
      try {
        const { error } = await supabase
          .from('departments')
          .insert(dept);
          
        if (error) {
          console.error(`Error adding department ${dept.name}:`, error);
        } else {
          console.log(`Added department: ${dept.name}`);
        }
      } catch (err) {
        console.error(`Exception adding department ${dept.name}:`, err);
      }
    }
    
    // Verify departments were added
    const { data: newDepts, error: verifyError } = await supabase
      .from('departments')
      .select('*')
      .order('name');
      
    if (verifyError) {
      console.error('Error verifying departments:', verifyError);
      return false;
    }
    
    console.log('Departments seeded successfully:');
    console.table(newDepts);
    
    return true;
  } catch (error) {
    console.error('Exception in seedDepartments:', error);
    return false;
  }
}

// Run the script
seedDepartments().then(result => {
  if (result) {
    console.log('Department seeding complete!');
  } else {
    console.error('Department seeding failed. See errors above.');
  }
}); 