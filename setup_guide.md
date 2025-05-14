# Database Setup Guide

Follow these steps to set up your Supabase database for the Masader Employee Hub:

## 1. Create the Tables

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to the SQL Editor (left sidebar)
4. Create a new query
5. Copy and paste the **entire** SQL from the `fix_sql_order.sql` file
6. Click "Run" to execute the SQL

## 2. Verify the Tables

After running the SQL, verify that the tables were created:

1. Navigate to the "Table Editor" in the Supabase dashboard
2. You should see these tables:
   - departments
   - users
   - time_off_requests
   - room_bookings
   - public_holidays

3. Check the departments table - it should contain the four departments with their admin emails

## 3. Try the Application Again

1. Restart the development server (if needed): `npm run dev`
2. Open the application in your browser
3. Try to sign up - you should now see the departments in the dropdown

## Troubleshooting

If you're still having issues:

1. Check the browser console for errors (F12 or right-click > Inspect > Console)
2. Verify your Supabase credentials in the `.env` file
3. Make sure you've run the SQL in the correct order (departments table must be created before users table)
4. Check if Row Level Security (RLS) is preventing access to the departments table

## Manual Solution for Departments

If needed, you can manually create the departments in the Supabase Table Editor:

1. Navigate to "Table Editor" > "departments"
2. Click "Insert row" and add each department:
   - Name: ESG, Admin Email: menna.g@be-masader.com
   - Name: Green Building, Admin Email: hossamjacoup@be-masader.com  
   - Name: Carbon, Admin Email: ramez.ragheb@be-masader.com
   - Name: Environmental Engineering, Admin Email: beshara@be-masader.com 