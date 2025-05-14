-- Fix for Supabase RLS policies causing infinite recursion
-- Run this SQL script in the Supabase SQL Editor

-- Disable RLS temporarily to make changes
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all user data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can update all user data" ON public.users;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own record" ON public.users;
DROP POLICY IF EXISTS "Public insert access" ON public.users;
DROP POLICY IF EXISTS "Users can view and update their own data" ON public.users;
DROP POLICY IF EXISTS "Admins have full access" ON public.users;
DROP POLICY IF EXISTS "Department admins can view their department's users" ON public.users;

-- Create simple policies that won't cause recursion
CREATE POLICY "Everyone can read users" 
ON public.users 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update themselves" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "New users can register" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY; 