-- Insert sample data if tables exist but are empty
-- Copy and run this in the Supabase SQL Editor

-- Insert departments if the table is empty
INSERT INTO public.departments (id, name, admin_email)
SELECT * FROM (
  VALUES 
    ('env-eng', 'Environmental Engineering', null),
    ('green-bldg', 'Green Building', null),
    ('carbon', 'Carbon', null),
    ('esg', 'ESG', null)
) AS t (id, name, admin_email)
WHERE NOT EXISTS (SELECT 1 FROM public.departments LIMIT 1);

-- Insert public holidays if the table is empty
INSERT INTO public.public_holidays (name, date)
SELECT * FROM (
  VALUES 
    ('New Year''s Day', '2024-01-01'),
    ('Coptic Christmas', '2024-01-07'),
    ('Revolution Day', '2024-01-25'),
    ('Sinai Liberation Day', '2024-04-25'),
    ('Labor Day', '2024-05-01'),
    ('Eid al-Fitr', '2024-04-10'),
    ('Eid al-Adha', '2024-06-17'),
    ('Revolution Day', '2024-07-23'),
    ('Islamic New Year', '2024-07-08'),
    ('Armed Forces Day', '2024-10-06'),
    ('Prophet Muhammad''s Birthday', '2024-09-16')
) AS t (name, date)
WHERE NOT EXISTS (SELECT 1 FROM public.public_holidays LIMIT 1); 