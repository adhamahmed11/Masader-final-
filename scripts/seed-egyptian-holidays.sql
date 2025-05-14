-- Seed script for Egyptian public holidays
-- Run this in the Supabase SQL Editor to add all public holidays to the database

-- First, check if the public_holidays table exists and create it if not
CREATE TABLE IF NOT EXISTS public_holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public_holidays ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read public holidays
CREATE POLICY "Public holidays are viewable by everyone" 
ON public_holidays FOR SELECT 
USING (true);

-- Only allow admins to modify public holidays
CREATE POLICY "Public holidays can be modified by admins" 
ON public_holidays FOR ALL
USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- Clear existing holidays (optional - remove this line if you want to keep existing entries)
-- DELETE FROM public_holidays;

-- Fixed-date holidays (these repeat every year on the same date)
-- Insert for current year (2024)
INSERT INTO public_holidays (name, date) VALUES
-- Egyptian National Holidays
('New Year''s Day', '2024-01-01'),
('Coptic Christmas Day', '2024-01-07'),
('Revolution Day (January 25)', '2024-01-25'),
('Sinai Liberation Day', '2024-04-25'),
('Labor Day', '2024-05-01'),
('June 30 Revolution', '2024-06-30'),
('Revolution Day (July 23)', '2024-07-23'),
('Armed Forces Day', '2024-10-06'),
('Sham El-Nessim', '2024-05-06'),

-- Islamic Holidays for 2024 (dates follow lunar calendar)
('Islamic New Year', '2024-07-08'),
('Prophet Muhammad''s Birthday', '2024-09-16'),
('Eid al-Fitr (1st day)', '2024-04-10'),
('Eid al-Fitr (2nd day)', '2024-04-11'),
('Eid al-Fitr (3rd day)', '2024-04-12'),
('Arafat Day', '2024-06-16'),
('Eid al-Adha (1st day)', '2024-06-17'),
('Eid al-Adha (2nd day)', '2024-06-18'),
('Eid al-Adha (3rd day)', '2024-06-19'),
('Eid al-Adha (4th day)', '2024-06-20')

ON CONFLICT (id) DO NOTHING;

-- Insert for next year (2025)
INSERT INTO public_holidays (name, date) VALUES
-- Egyptian National Holidays
('New Year''s Day', '2025-01-01'),
('Coptic Christmas Day', '2025-01-07'),
('Revolution Day (January 25)', '2025-01-25'),
('Sinai Liberation Day', '2025-04-25'),
('Labor Day', '2025-05-01'),
('June 30 Revolution', '2025-06-30'),
('Revolution Day (July 23)', '2025-07-23'),
('Armed Forces Day', '2025-10-06'),
('Sham El-Nessim', '2025-04-21'),

-- Islamic Holidays for 2025 (dates follow lunar calendar)
('Islamic New Year', '2025-06-27'),
('Prophet Muhammad''s Birthday', '2025-09-05'),
('Eid al-Fitr (1st day)', '2025-03-31'),
('Eid al-Fitr (2nd day)', '2025-04-01'),
('Eid al-Fitr (3rd day)', '2025-04-02'),
('Arafat Day', '2025-06-06'),
('Eid al-Adha (1st day)', '2025-06-07'),
('Eid al-Adha (2nd day)', '2025-06-08'),
('Eid al-Adha (3rd day)', '2025-06-09'),
('Eid al-Adha (4th day)', '2025-06-10')

ON CONFLICT (id) DO NOTHING;

-- Query to verify holidays were inserted
SELECT * FROM public_holidays ORDER BY date; 