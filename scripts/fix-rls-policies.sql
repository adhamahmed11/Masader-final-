-- Fix RLS policies for Masader Employee Hub
-- This script addresses the infinite recursion issues in Row Level Security policies

-- Drop problematic policies for users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON public.users;

-- Create simplified policies without recursive calls
-- 1. Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.users FOR SELECT 
USING (id = auth.uid());

-- 2. Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 3. Admin users can view all profiles
CREATE POLICY "Admin users can view all profiles" 
ON public.users FOR SELECT 
USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- 4. Admin users can update all profiles
CREATE POLICY "Admin users can update all profiles" 
ON public.users FOR UPDATE 
USING (
  auth.jwt() ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);

-- Fix policies for room_bookings table
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.room_bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.room_bookings;
DROP POLICY IF EXISTS "Admin users can view all bookings" ON public.room_bookings;
DROP POLICY IF EXISTS "Admin users can update all bookings" ON public.room_bookings;

-- Create simplified policies for room_bookings
CREATE POLICY "Users can view their own bookings" 
ON public.room_bookings FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own bookings" 
ON public.room_bookings FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin users can view all bookings" 
ON public.room_bookings FOR SELECT 
USING (
  auth.jwt() ->> 'role' = 'admin'
);

CREATE POLICY "Admin users can update all bookings" 
ON public.room_bookings FOR UPDATE 
USING (
  auth.jwt() ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);

-- Fix policies for time_off_requests table
DROP POLICY IF EXISTS "Users can view their own requests" ON public.time_off_requests;
DROP POLICY IF EXISTS "Users can create their own requests" ON public.time_off_requests;
DROP POLICY IF EXISTS "Admin users can view all requests" ON public.time_off_requests;
DROP POLICY IF EXISTS "Admin users can update all requests" ON public.time_off_requests;

-- Create simplified policies for time_off_requests
CREATE POLICY "Users can view their own requests" 
ON public.time_off_requests FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own requests" 
ON public.time_off_requests FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin users can view all requests" 
ON public.time_off_requests FOR SELECT 
USING (
  auth.jwt() ->> 'role' = 'admin'
);

CREATE POLICY "Admin users can update all requests" 
ON public.time_off_requests FOR UPDATE 
USING (
  auth.jwt() ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);

-- Create appropriate policies for departments
DROP POLICY IF EXISTS "Anyone can view departments" ON public.departments;
DROP POLICY IF EXISTS "Admin users can manage departments" ON public.departments;

CREATE POLICY "Anyone can view departments" 
ON public.departments FOR SELECT 
USING (true);

CREATE POLICY "Admin users can manage departments" 
ON public.departments FOR ALL
USING (
  auth.jwt() ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);

-- Create a script to create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  admin_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.room_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  room_type TEXT NOT NULL CHECK (room_type IN ('Meeting', 'Lounge')),
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.time_off_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('vacation', 'sick', 'personal', 'other')),
  start_date DATE NOT NULL,
  end_date DATE,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY; 