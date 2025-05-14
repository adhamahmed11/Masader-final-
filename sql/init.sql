-- Create departments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  admin_email text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Remove any existing RLS policies on the departments table
DROP POLICY IF EXISTS "Public read access" ON public.departments;
DROP POLICY IF EXISTS "Admin full access" ON public.departments;

-- Enable RLS on the departments table
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Add a policy for public read access to departments
CREATE POLICY "Public read access" 
ON public.departments 
FOR SELECT 
USING (true);

-- Create function for public access to departments
CREATE OR REPLACE FUNCTION get_departments_public()
RETURNS SETOF departments
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT * FROM departments ORDER BY name;
$$;

-- Insert default departments if they don't exist
INSERT INTO public.departments (name, admin_email)
SELECT 'ESG', 'esg@masader.com'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'ESG');

INSERT INTO public.departments (name, admin_email)
SELECT 'Green Building', 'green@masader.com'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Green Building');

INSERT INTO public.departments (name, admin_email)
SELECT 'Carbon', 'carbon@masader.com'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Carbon');

INSERT INTO public.departments (name, admin_email)
SELECT 'Environmental Engineering', 'engineering@masader.com'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Environmental Engineering'); 