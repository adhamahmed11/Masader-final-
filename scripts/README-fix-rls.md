# Fix for "infinite recursion detected in policy for relation 'users'"

This directory contains scripts to fix the infinite recursion error in Supabase Row Level Security (RLS) policies for the `users` table.

## The Problem

The error "infinite recursion detected in policy for relation 'users'" occurs when an RLS policy tries to reference the same table it's protecting in a way that creates a circular reference. This typically happens with:

- Policies that use subqueries against the same table they're protecting
- Admin policies that check user roles by querying the users table

## Solution Options

### Option 1: Simple Direct Fix (Recommended)

The file `fix-rls-simple.sql` contains the simplest solution with just the essential policies:

```sql
-- READ policy
CREATE POLICY "Users can read their own profile"
ON users
FOR SELECT
USING (id = auth.uid());

-- UPDATE policy
CREATE POLICY "Users can update their own profile"
ON users
FOR UPDATE
USING (id = auth.uid());
```

This approach avoids any subqueries to the users table, preventing recursion.

### Option 2: Complete Solution with Admin Access

The file `fix-rls-infinite-recursion.sql` provides a more comprehensive solution that:
- Implements the basic user policies
- Adds a security definer function for admin access that bypasses RLS checks

## How to Apply the Fix

### Method 1: Using the JavaScript Script (Requires Service Role Key)

1. Add your Supabase service role key to your `.env` file:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Install dependencies if needed:
   ```
   npm install @supabase/supabase-js dotenv
   ```

3. Run the script:
   ```
   node scripts/run-fix-rls.js
   ```

### Method 2: Manual SQL Execution in Supabase Dashboard (Recommended)

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `fix-rls-simple.sql`
4. Run the SQL

## After Applying the Fix

After applying either fix:
1. The "infinite recursion detected in policy for relation 'users'" error should be resolved
2. Users should be able to read and update their own profiles
3. The application should function correctly with the simplified RLS policies

If you need admin functionality later, you can add those policies using option 2 or create custom endpoints that use Service Role access to bypass RLS completely. 