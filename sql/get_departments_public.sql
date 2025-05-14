-- Function to get departments without RLS restrictions
-- This can be used for public access to department data
CREATE OR REPLACE FUNCTION get_departments_public()
RETURNS SETOF departments
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT * FROM departments ORDER BY name;
$$; 