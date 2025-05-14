-- SQL functions to create tables in Supabase
-- Copy and run this in the Supabase SQL Editor

-- Function to create departments table
CREATE OR REPLACE FUNCTION create_departments_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'departments') THEN
    CREATE TABLE public.departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      admin_email TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
    
    -- Add RLS policies
    ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
    
    -- Anyone can read departments
    CREATE POLICY "Allow anyone to read departments"
      ON public.departments
      FOR SELECT
      TO authenticated
      USING (true);
      
    -- Only admins can modify departments
    CREATE POLICY "Allow admins to modify departments"
      ON public.departments
      FOR ALL
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT id FROM public.users WHERE role = 'admin'
        )
      );
      
    RAISE NOTICE 'Created departments table';
  ELSE
    RAISE NOTICE 'departments table already exists';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create time_off_requests table
CREATE OR REPLACE FUNCTION create_time_off_requests_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'time_off_requests') THEN
    CREATE TABLE public.time_off_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users NOT NULL,
      type TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      notes TEXT,
      status TEXT DEFAULT 'pending' NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
    
    -- Add RLS policies
    ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;
    
    -- Users can read their own time off requests
    CREATE POLICY "Users can read their own time off requests"
      ON public.time_off_requests
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
      
    -- Users can insert their own time off requests
    CREATE POLICY "Users can insert their own time off requests"
      ON public.time_off_requests
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
      
    -- Admins can read all time off requests
    CREATE POLICY "Admins can read all time off requests"
      ON public.time_off_requests
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT id FROM public.users WHERE role = 'admin'
        )
      );
      
    -- Admins can update any time off request
    CREATE POLICY "Admins can update any time off request"
      ON public.time_off_requests
      FOR UPDATE
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT id FROM public.users WHERE role = 'admin'
        )
      );
      
    RAISE NOTICE 'Created time_off_requests table';
  ELSE
    RAISE NOTICE 'time_off_requests table already exists';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create room_bookings table
CREATE OR REPLACE FUNCTION create_room_bookings_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'room_bookings') THEN
    CREATE TABLE public.room_bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users NOT NULL,
      room_type TEXT NOT NULL,
      date DATE NOT NULL,
      time_slot TEXT NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'pending' NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
    
    -- Add RLS policies
    ALTER TABLE public.room_bookings ENABLE ROW LEVEL SECURITY;
    
    -- Users can read their own room bookings
    CREATE POLICY "Users can read their own room bookings"
      ON public.room_bookings
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
      
    -- Users can insert their own room bookings
    CREATE POLICY "Users can insert their own room bookings"
      ON public.room_bookings
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
      
    -- Admins can read all room bookings
    CREATE POLICY "Admins can read all room bookings"
      ON public.room_bookings
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT id FROM public.users WHERE role = 'admin'
        )
      );
      
    -- Admins can update any room booking
    CREATE POLICY "Admins can update any room booking"
      ON public.room_bookings
      FOR UPDATE
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT id FROM public.users WHERE role = 'admin'
        )
      );
      
    RAISE NOTICE 'Created room_bookings table';
  ELSE
    RAISE NOTICE 'room_bookings table already exists';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create public_holidays table
CREATE OR REPLACE FUNCTION create_public_holidays_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'public_holidays') THEN
    CREATE TABLE public.public_holidays (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
    
    -- Add RLS policies
    ALTER TABLE public.public_holidays ENABLE ROW LEVEL SECURITY;
    
    -- Anyone can read public holidays
    CREATE POLICY "Anyone can read public holidays"
      ON public.public_holidays
      FOR SELECT
      TO authenticated
      USING (true);
      
    -- Only admins can modify public holidays
    CREATE POLICY "Only admins can modify public holidays"
      ON public.public_holidays
      FOR ALL
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT id FROM public.users WHERE role = 'admin'
        )
      );
      
    RAISE NOTICE 'Created public_holidays table';
  ELSE
    RAISE NOTICE 'public_holidays table already exists';
  END IF;
END;
$$ LANGUAGE plpgsql; 