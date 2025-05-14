# Fix for "infinite recursion detected in policy for relation 'users'"

This directory contains scripts to fix the infinite recursion error in Supabase RLS policies for the `users` table.

## The Problem

The error "infinite recursion detected in policy for relation 'users'" occurs when a Row Level Security (RLS) policy tries to reference itself in a circular way. This typically happens when:

1. You have a policy that checks user roles by querying the same table it's protecting
2. The query creates a circular reference, causing Supabase to enter an infinite loop

## Solution Options

We provide two different approaches to fix this issue:

### Option 1: Direct User ID Check + Subquery (fix-user-policies.sql)

This approach uses:
- Direct `auth.uid() = id` check for user's own records
- A subquery for admin checks that doesn't cause recursion

### Option 2: Security Definer Function (fix-user-policies-alternative.sql)

This approach creates a security definer function that can bypass RLS checks, avoiding the recursion entirely.

## How to Apply the Fix

### Method 1: Using the JavaScript Script (Recommended)

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
   node scripts/apply-fix.js
   ```

### Method 2: Manual SQL Execution in Supabase Dashboard

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Paste the contents of either `fix-user-policies.sql` or `fix-user-policies-alternative.sql`
4. Run the SQL

## Which Method to Choose?

- Start with Option 1 as it's simpler
- If Option 1 doesn't resolve the issue, try Option 2 which is more thorough

## Verifying the Fix

After applying either fix, the error "infinite recursion detected in policy for relation 'users'" should be resolved, and your application should be able to access the users table without issues. 