-- First, create the departments table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'departments') THEN
    CREATE TABLE public.departments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      admin_email TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
  END IF;
END $$;

-- Then create users table with reference to departments if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    CREATE TABLE public.users (
      id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      department TEXT,
      department_id UUID REFERENCES public.departments(id),
      role TEXT DEFAULT 'employee' CHECK (role IN ('admin', 'employee')) NOT NULL
    );
  END IF;
END $$;

-- Create time off requests table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'time_off_requests') THEN
    CREATE TABLE public.time_off_requests (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.users NOT NULL,
      type TEXT CHECK (type IN ('Holiday', 'Sick Day', 'Work from Home')) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
  END IF;
END $$;

-- Create room bookings table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'room_bookings') THEN
    CREATE TABLE public.room_bookings (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.users NOT NULL,
      room_type TEXT CHECK (room_type IN ('Meeting', 'Lounge')) NOT NULL,
      date DATE NOT NULL,
      time_slot TEXT NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
  END IF;
END $$;

-- Create public holidays table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'public_holidays') THEN
    CREATE TABLE public.public_holidays (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
  END IF;
END $$;

-- Add Row Level Security (RLS) policies

-- Enable RLS on tables (this is idempotent, so no need to check)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_holidays ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$ 
BEGIN
  -- Users table policies
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow users to view their own profile') THEN
    CREATE POLICY "Allow users to view their own profile"
      ON public.users FOR SELECT
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow admins to view all profiles') THEN
    CREATE POLICY "Allow admins to view all profiles"
      ON public.users FOR SELECT
      USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;

  -- Departments table policies
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'departments' AND policyname = 'Allow everyone to view departments') THEN
    CREATE POLICY "Allow everyone to view departments"
      ON public.departments FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'departments' AND policyname = 'Allow admins to modify departments') THEN
    CREATE POLICY "Allow admins to modify departments"
      ON public.departments FOR ALL
      USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;

  -- Time off requests policies
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'time_off_requests' AND policyname = 'Allow users to view their own requests') THEN
    CREATE POLICY "Allow users to view their own requests"
      ON public.time_off_requests FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'time_off_requests' AND policyname = 'Allow users to create their own requests') THEN
    CREATE POLICY "Allow users to create their own requests"
      ON public.time_off_requests FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'time_off_requests' AND policyname = 'Allow admins to view all time off requests') THEN
    CREATE POLICY "Allow admins to view all time off requests"
      ON public.time_off_requests FOR SELECT
      USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'time_off_requests' AND policyname = 'Allow admins to update any time off request') THEN
    CREATE POLICY "Allow admins to update any time off request"
      ON public.time_off_requests FOR UPDATE
      USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;

  -- Room bookings policies
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'room_bookings' AND policyname = 'Allow users to view their own bookings') THEN
    CREATE POLICY "Allow users to view their own bookings"
      ON public.room_bookings FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'room_bookings' AND policyname = 'Allow users to view all approved bookings') THEN
    CREATE POLICY "Allow users to view all approved bookings"
      ON public.room_bookings FOR SELECT
      USING (status = 'approved');
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'room_bookings' AND policyname = 'Allow users to create their own bookings') THEN
    CREATE POLICY "Allow users to create their own bookings"
      ON public.room_bookings FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'room_bookings' AND policyname = 'Allow admins to view all room bookings') THEN
    CREATE POLICY "Allow admins to view all room bookings"
      ON public.room_bookings FOR SELECT
      USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'room_bookings' AND policyname = 'Allow admins to update any room booking') THEN
    CREATE POLICY "Allow admins to update any room booking"
      ON public.room_bookings FOR UPDATE
      USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;

  -- Public holidays policies
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'public_holidays' AND policyname = 'Allow everyone to view public holidays') THEN
    CREATE POLICY "Allow everyone to view public holidays"
      ON public.public_holidays FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'public_holidays' AND policyname = 'Allow only admins to modify public holidays') THEN
    CREATE POLICY "Allow only admins to modify public holidays"
      ON public.public_holidays FOR INSERT
      WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'public_holidays' AND policyname = 'Allow only admins to update public holidays') THEN
    CREATE POLICY "Allow only admins to update public holidays"
      ON public.public_holidays FOR UPDATE
      USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'public_holidays' AND policyname = 'Allow only admins to delete public holidays') THEN
    CREATE POLICY "Allow only admins to delete public holidays"
      ON public.public_holidays FOR DELETE
      USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
  END IF;
END $$;

-- Insert departments if they don't exist yet
DO $$ 
BEGIN
  -- Only insert departments if the table exists but is empty
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'departments') 
     AND NOT EXISTS (SELECT FROM public.departments LIMIT 1) THEN
    
    INSERT INTO public.departments (name, admin_email) VALUES 
      ('ESG', 'menna.g@be-masader.com'),
      ('Green Building', 'hossamjacoup@be-masader.com'),
      ('Carbon', 'ramez.ragheb@be-masader.com'),
      ('Environmental Engineering', 'beshara@be-masader.com');
  END IF;
END $$; 