-- Quick fix for "infinite recursion detected in policy for relation users"
-- Drop all existing policies on the users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;
DROP POLICY IF EXISTS "Users can insert own record" ON users;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create minimal policies
-- 1. Simple policy for users to view their own record
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

-- 2. Simple policy for users to update their own record
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
USING (auth.uid() = id);

-- 3. Simple policy for users to insert their own record
CREATE POLICY "Users can insert own record"
ON users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- For admin permissions, you can add these back later after testing 