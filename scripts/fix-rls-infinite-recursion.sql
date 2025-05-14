-- Fix infinite recursion in users table policies
-- First, drop any existing policies on the users table to start clean
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;
DROP POLICY IF EXISTS "Users can insert own record" ON users;
DROP POLICY IF EXISTS "Users can read their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create simple policies without subqueries to avoid recursion
-- READ policy - users can read their own profile
CREATE POLICY "Users can read their own profile"
ON users
FOR SELECT
USING (id = auth.uid());

-- UPDATE policy - users can update their own profile
CREATE POLICY "Users can update their own profile"
ON users
FOR UPDATE
USING (id = auth.uid());

-- INSERT policy - users can insert their own record (for signup)
CREATE POLICY "Users can insert own record"
ON users
FOR INSERT
WITH CHECK (id = auth.uid());

-- For admin access, create a separate security definer function
-- This lets admins bypass RLS without causing recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  _role TEXT;
BEGIN
  -- Get the role directly from the auth.uid() without a recursive policy check
  SELECT role INTO _role FROM users WHERE id = auth.uid();
  RETURN _role = 'admin';
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;

-- Admin policies using the security definer function
CREATE POLICY "Admins can view all profiles"
ON users
FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update all profiles"
ON users
FOR UPDATE
USING (is_admin()); 