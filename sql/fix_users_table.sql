-- Drop all existing problematic RLS policies for users table
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all user data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can update all user data" ON public.users;
DROP POLICY IF EXISTS "Department admins can view their department's users" ON public.users;
DROP POLICY IF EXISTS "Public insert access" ON public.users;
DROP POLICY IF EXISTS "Users can view and update their own data" ON public.users;
DROP POLICY IF EXISTS "Admins have full access" ON public.users;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  department TEXT,
  department_id UUID,
  role TEXT DEFAULT 'employee'::text NOT NULL
);

-- Create simple policies that won't cause recursion
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Anyone can insert
CREATE POLICY "Anyone can insert" 
ON public.users 
FOR INSERT 
TO authenticated, anon
WITH CHECK (true);

-- Simple policy for selecting your own data
CREATE POLICY "Select own data" 
ON public.users 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Simple policy for updating your own data
CREATE POLICY "Update own data" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Simple admin view all policy (no recursion)
CREATE POLICY "Admin view all" 
ON public.users 
FOR SELECT 
TO authenticated
USING (role = 'admin');

-- Add a function to check if a user exists
CREATE OR REPLACE FUNCTION public.check_user_exists(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = user_id);
$$;

-- Add a dummy admin user if no users exist
INSERT INTO public.users (id, email, full_name, role)
SELECT 
  '11111111-1111-1111-1111-111111111111', 
  'admin@masader.com', 
  'Admin User', 
  'admin'
WHERE NOT EXISTS (SELECT 1 FROM public.users);

-- Function to get all users (for admin use)
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS SETOF public.users
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT * FROM public.users ORDER BY created_at DESC;
$$; 