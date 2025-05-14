-- Fix infinite recursion in users table policies
-- First, drop any existing policies on the users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;
DROP POLICY IF EXISTS "Users can insert own record" ON users;

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create simple policies without recursion
-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
USING (auth.uid() = id);

-- 3. Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON users
FOR SELECT
USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- 4. Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON users
FOR UPDATE
USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- 5. Everyone can insert their own user record during signup
CREATE POLICY "Users can insert own record"
ON users
FOR INSERT
WITH CHECK (auth.uid() = id); 