-- Supabase / Postgres schema for RailAxis
-- Run this in the Supabase SQL editor (SQL > New query) and execute.

-- USERS (fields match backend model: camelCase)
CREATE TABLE IF NOT EXISTS public.users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text,
  email text UNIQUE NOT NULL CONSTRAINT email_check CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$') CONSTRAINT email_lowercase CHECK (email = lower(email)),
  password text NOT NULL,
  role text DEFAULT 'user' CONSTRAINT role_check CHECK (role IN ('user', 'admin')),
  phone text CONSTRAINT phone_check CHECK (phone IS NULL OR phone ~* '^\+?[0-9]{10,15}$'),
  "isActive" boolean DEFAULT true,
  "lastLogin" timestamptz,
  "createdAt" timestamptz DEFAULT now()
);

-- TRAINS
CREATE TABLE IF NOT EXISTS public.trains (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "trainNumber" text UNIQUE NOT NULL,
  "trainName" text NOT NULL,
  source text NOT NULL,
  destination text NOT NULL,
  "departureTime" text,
  "arrivalTime" text,
  duration text,
  "totalSeats" integer NOT NULL CONSTRAINT total_seats_check CHECK ("totalSeats" >= 0),
  "availableSeats" integer NOT NULL CONSTRAINT available_seats_check CHECK ("availableSeats" >= 0 AND "availableSeats" <= "totalSeats"),
  "trainType" text,
  "baseFare" numeric NOT NULL CONSTRAINT base_fare_check CHECK ("baseFare" >= 0),
  classes jsonb,
  "daysOfOperation" text[],
  distance integer,
  amenities text[],
  rating numeric,
  "isActive" boolean DEFAULT true,
  "createdAt" timestamptz DEFAULT now()
);

-- STATIONS
CREATE TABLE IF NOT EXISTS public.stations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  city text NOT NULL,
  state text,
  platforms integer CONSTRAINT platforms_check CHECK (platforms >= 0),
  "isActive" boolean DEFAULT true,
  "createdAt" timestamptz DEFAULT now()
);

-- BOOKINGS (fields use camelCase to match backend model)
CREATE TABLE IF NOT EXISTS public.bookings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "user" bigint,
  "train" bigint,
  "pnrNumber" text UNIQUE NOT NULL,
  "trainSnapshot" jsonb,
  passengers jsonb,
  "contactInfo" jsonb,
  "journeyDate" date NOT NULL,
  "seatClass" text,
  "baseFare" numeric CONSTRAINT booking_base_fare_check CHECK ("baseFare" >= 0),
  taxes numeric CONSTRAINT booking_taxes_check CHECK (taxes >= 0),
  "totalFare" numeric CONSTRAINT booking_total_fare_check CHECK ("totalFare" >= 0),
  status text DEFAULT 'Confirmed' CONSTRAINT status_check CHECK (status IN ('Confirmed', 'Cancelled', 'Pending')),
  "qrCode" text,
  "refundAmount" numeric CONSTRAINT refund_amount_check CHECK ("refundAmount" >= 0),
  "cancellationReason" text,
  "cancelledAt" timestamptz,
  "paymentStatus" text CONSTRAINT payment_status_check CHECK ("paymentStatus" IN ('Paid', 'Unpaid', 'Refunded', 'Failed')),
  "createdAt" timestamptz DEFAULT now()
);

-- TODOS (demo table for frontend)
CREATE TABLE IF NOT EXISTS public.todos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  done boolean DEFAULT false,
  "insertedAt" timestamptz DEFAULT now()
);

-- Foreign-key relationships
ALTER TABLE IF EXISTS public.bookings
  ADD CONSTRAINT bookings_user_fkey FOREIGN KEY ("user") REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.bookings
  ADD CONSTRAINT bookings_train_fkey FOREIGN KEY ("train") REFERENCES public.trains(id) ON DELETE SET NULL;

-- Performance indexes for large-scale operations
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

CREATE INDEX IF NOT EXISTS idx_trains_search ON public.trains(source, destination, "isActive");
CREATE INDEX IF NOT EXISTS idx_trains_number ON public.trains("trainNumber");

CREATE INDEX IF NOT EXISTS idx_stations_code ON public.stations(code);
CREATE INDEX IF NOT EXISTS idx_stations_city ON public.stations(city);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings("user");
CREATE INDEX IF NOT EXISTS idx_bookings_train ON public.bookings("train");
CREATE INDEX IF NOT EXISTS idx_bookings_journey_date ON public.bookings("journeyDate");
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- 1. users: Restrict public/anon reads or writes entirely. Access is managed by service_role (Node backend).
-- No policies defined, meaning default deny for everyone except service_role.

-- 2. trains: Public read access for everyone. Writes only by service_role (Node backend).
CREATE POLICY "Allow public read access to trains" ON public.trains
  FOR SELECT TO public USING (true);

-- 3. stations: Public read access for everyone. Writes only by service_role (Node backend).
CREATE POLICY "Allow public read access to stations" ON public.stations
  FOR SELECT TO public USING (true);

-- 4. bookings: Restrict public/anon reads or writes entirely. Access is managed by service_role.
-- No policies defined, meaning default deny for everyone except service_role.

-- 5. todos: Fully public CRUD access for frontend client demo (matches typical tutorial/demo needs).
CREATE POLICY "Allow public select on todos" ON public.todos FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert on todos" ON public.todos FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update on todos" ON public.todos FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete on todos" ON public.todos FOR DELETE TO public USING (true);
