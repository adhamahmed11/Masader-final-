-- Disable RLS for users table temporarily
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- Drop existing problematic RLS policies for users table
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all user data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can update all user data" ON public.users;
DROP POLICY IF EXISTS "Department admins can view their department's users" ON public.users;

-- Create simpler RLS policies for users table
CREATE POLICY "Public insert access" 
ON public.users
FOR INSERT 
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "Users can view and update their own data" 
ON public.users
USING (auth.uid() = id);

CREATE POLICY "Admins have full access" 
ON public.users
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Re-enable RLS for users table
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY; 