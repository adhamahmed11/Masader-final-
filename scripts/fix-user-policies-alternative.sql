-- Alternative fix for infinite recursion in users table policies
-- This approach uses direct checks against auth.uid() rather than subqueries

-- First, drop any existing policies on the users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;
DROP POLICY IF EXISTS "Users can insert own record" ON users;

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check if a user is an admin
-- This avoids recursive policy checking
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  _is_admin BOOLEAN;
BEGIN
  SELECT (role = 'admin') INTO _is_admin
  FROM users
  WHERE id = auth.uid();
  
  RETURN COALESCE(_is_admin, false);
END;
$$;

-- Create policies using the security definer function
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
USING (is_admin());

-- 4. Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON users
FOR UPDATE
USING (is_admin());

-- 5. Everyone can insert their own user record during signup
CREATE POLICY "Users can insert own record"
ON users
FOR INSERT
WITH CHECK (auth.uid() = id); 