-- Simple fix for infinite recursion in users table RLS policies
-- Drop all existing policies on the users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;
DROP POLICY IF EXISTS "Users can insert own record" ON users;
DROP POLICY IF EXISTS "Users can read their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Add basic policies exactly as recommended
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

-- INSERT policy (needed for signup)
CREATE POLICY "Users can insert own record"
ON users
FOR INSERT
WITH CHECK (id = auth.uid()); 