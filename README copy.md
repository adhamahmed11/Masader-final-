# Masader Employee Hub

An internal HR web application for Masader employees with time-off management, room booking, and shared calendar features.

## Frontend + Backend Stack

- **Frontend**: React + TypeScript + Vite + ShadCN UI
- **Backend**: Supabase (PostgreSQL + Auth + RLS)

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Get your project URL and anon key from Project Settings > API
3. Create a `.env` file in the project root with:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Table Setup

Run the following SQL in the Supabase SQL Editor to create the required tables:

```sql
-- First, create the departments table
CREATE TABLE public.departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Then create users table with reference to departments
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  department TEXT,
  department_id UUID REFERENCES public.departments(id),
  role TEXT DEFAULT 'employee' CHECK (role IN ('admin', 'employee')) NOT NULL
);

-- Create time off requests table
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

-- Create room bookings table
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

-- Create public holidays table
CREATE TABLE public.public_holidays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add Row Level Security (RLS) policies

-- Enable RLS on tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_holidays ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Allow users to view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Allow admins to view all profiles"
  ON public.users FOR SELECT
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Departments table policies
CREATE POLICY "Allow everyone to view departments"
  ON public.departments FOR SELECT
  USING (true);

CREATE POLICY "Allow admins to modify departments"
  ON public.departments FOR ALL
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Time off requests policies
CREATE POLICY "Allow users to view their own requests"
  ON public.time_off_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to create their own requests"
  ON public.time_off_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admins to view all time off requests"
  ON public.time_off_requests FOR SELECT
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Allow admins to update any time off request"
  ON public.time_off_requests FOR UPDATE
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Room bookings policies
CREATE POLICY "Allow users to view their own bookings"
  ON public.room_bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to view all approved bookings"
  ON public.room_bookings FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Allow users to create their own bookings"
  ON public.room_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admins to view all room bookings"
  ON public.room_bookings FOR SELECT
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Allow admins to update any room booking"
  ON public.room_bookings FOR UPDATE
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Public holidays policies (everyone can view)
CREATE POLICY "Allow everyone to view public holidays"
  ON public.public_holidays FOR SELECT
  USING (true);

CREATE POLICY "Allow only admins to modify public holidays"
  ON public.public_holidays FOR INSERT
  WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Allow only admins to update public holidays"
  ON public.public_holidays FOR UPDATE
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Allow only admins to delete public holidays"
  ON public.public_holidays FOR DELETE
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Insert departments
INSERT INTO public.departments (name, admin_email) VALUES 
  ('ESG', 'menna.g@be-masader.com'),
  ('Green Building', 'hossamjacoup@be-masader.com'),
  ('Carbon', 'ramez.ragheb@be-masader.com'),
  ('Environmental Engineering', 'beshara@be-masader.com');
```

### 3. Supabase Auth Setup

1. Enable Email/Password sign-up in Authentication > Providers
2. Configure Email Templates in Authentication > Email Templates
3. Create your first admin user by:
   - Signing up through the application
   - Running this SQL to make the user an admin:
   ```sql
   UPDATE public.users SET role = 'admin' WHERE email = 'admin@example.com';
   ```

### 4. Supabase Edge Functions (Optional)

For email notifications on time off requests, deploy the Edge Function:

1. Install Supabase CLI
2. Run `supabase functions deploy send-time-off-notification`
3. Set environment variables for SMTP in the Supabase dashboard

### 5. Install Dependencies & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Features

- **Authentication**: Email/password login with role-based access
- **Time Off Management**: Request and track time off
- **Room Booking**: Book meeting rooms and lounges
- **Shared Calendar**: View all approved time off and room bookings
- **Admin Panel**: Approve/reject requests and manage public holidays
- **Department Management**: Department-specific admins can manage their team's requests

## Department Structure

The application supports department-based management with the following structure:

| Department | Admin Email |
|------------|-------------|
| ESG | menna.g@be-masader.com |
| Green Building | hossamjacoup@be-masader.com |
| Carbon | ramez.ragheb@be-masader.com | 
| Environmental Engineering | beshara@be-masader.com |

Each employee selects their department when signing up, and their requests are sent to both:
- Their department admin
- The HR admin (hania.sameh@be-masader.com)

Department admins can only manage requests from employees in their department, while the HR admin can manage all requests.

## Notes

- Default admin emails for notifications are:
  - beshara@be-masader.com
  - hania.sameh@be-masader.com
  - menna.g@be-masader.com
  - ramez.ragheb@be-masader.com
  - hossamjacoup@be-masader.com