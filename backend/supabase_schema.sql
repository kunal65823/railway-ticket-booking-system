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

-- Keep existing tables compatible if they were created before this schema file.
ALTER TABLE IF EXISTS public.bookings
  ADD COLUMN IF NOT EXISTS "user" bigint,
  ADD COLUMN IF NOT EXISTS "train" bigint,
  ADD COLUMN IF NOT EXISTS "pnrNumber" text,
  ADD COLUMN IF NOT EXISTS "trainSnapshot" jsonb,
  ADD COLUMN IF NOT EXISTS passengers jsonb,
  ADD COLUMN IF NOT EXISTS "contactInfo" jsonb,
  ADD COLUMN IF NOT EXISTS "journeyDate" date,
  ADD COLUMN IF NOT EXISTS "seatClass" text,
  ADD COLUMN IF NOT EXISTS "baseFare" numeric,
  ADD COLUMN IF NOT EXISTS taxes numeric,
  ADD COLUMN IF NOT EXISTS "totalFare" numeric,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'Confirmed',
  ADD COLUMN IF NOT EXISTS "qrCode" text,
  ADD COLUMN IF NOT EXISTS "refundAmount" numeric,
  ADD COLUMN IF NOT EXISTS "cancellationReason" text,
  ADD COLUMN IF NOT EXISTS "cancelledAt" timestamptz,
  ADD COLUMN IF NOT EXISTS "paymentStatus" text,
  ADD COLUMN IF NOT EXISTS "createdAt" timestamptz DEFAULT now();

ALTER TABLE IF EXISTS public.trains
  ADD COLUMN IF NOT EXISTS "trainNumber" text,
  ADD COLUMN IF NOT EXISTS "trainName" text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS destination text,
  ADD COLUMN IF NOT EXISTS "departureTime" text,
  ADD COLUMN IF NOT EXISTS "arrivalTime" text,
  ADD COLUMN IF NOT EXISTS duration text,
  ADD COLUMN IF NOT EXISTS "totalSeats" integer,
  ADD COLUMN IF NOT EXISTS "availableSeats" integer,
  ADD COLUMN IF NOT EXISTS "trainType" text,
  ADD COLUMN IF NOT EXISTS "baseFare" numeric,
  ADD COLUMN IF NOT EXISTS classes jsonb,
  ADD COLUMN IF NOT EXISTS "daysOfOperation" text[],
  ADD COLUMN IF NOT EXISTS distance integer,
  ADD COLUMN IF NOT EXISTS amenities text[],
  ADD COLUMN IF NOT EXISTS rating numeric,
  ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS "createdAt" timestamptz DEFAULT now();

ALTER TABLE IF EXISTS public.stations
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS code text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS platforms integer,
  ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS "createdAt" timestamptz DEFAULT now();

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS password text,
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS "lastLogin" timestamptz,
  ADD COLUMN IF NOT EXISTS "createdAt" timestamptz DEFAULT now();

ALTER TABLE IF EXISTS public.todos
  ADD COLUMN IF NOT EXISTS "insertedAt" timestamptz DEFAULT now();

-- Remove duplicate lowercase columns left by older unquoted camelCase schemas.
DO $$
DECLARE
  mapping text[];
  table_name text;
  legacy_column text;
  current_column text;
  current_type text;
BEGIN
  FOREACH mapping SLICE 1 IN ARRAY ARRAY[
    ARRAY['public.trains', 'trainnumber', 'trainNumber'],
    ARRAY['public.trains', 'trainname', 'trainName'],
    ARRAY['public.trains', 'departuretime', 'departureTime'],
    ARRAY['public.trains', 'arrivaltime', 'arrivalTime'],
    ARRAY['public.trains', 'totalseats', 'totalSeats'],
    ARRAY['public.trains', 'availableseats', 'availableSeats'],
    ARRAY['public.trains', 'traintype', 'trainType'],
    ARRAY['public.trains', 'basefare', 'baseFare'],
    ARRAY['public.trains', 'daysofoperation', 'daysOfOperation'],
    ARRAY['public.trains', 'isactive', 'isActive'],
    ARRAY['public.trains', 'createdat', 'createdAt'],
    ARRAY['public.users', 'isactive', 'isActive'],
    ARRAY['public.users', 'lastlogin', 'lastLogin'],
    ARRAY['public.users', 'createdat', 'createdAt'],
    ARRAY['public.stations', 'isactive', 'isActive'],
    ARRAY['public.stations', 'createdat', 'createdAt'],
    ARRAY['public.bookings', 'pnrnumber', 'pnrNumber'],
    ARRAY['public.bookings', 'trainsnapshot', 'trainSnapshot'],
    ARRAY['public.bookings', 'contactinfo', 'contactInfo'],
    ARRAY['public.bookings', 'journeydate', 'journeyDate'],
    ARRAY['public.bookings', 'seatclass', 'seatClass'],
    ARRAY['public.bookings', 'basefare', 'baseFare'],
    ARRAY['public.bookings', 'totalfare', 'totalFare'],
    ARRAY['public.bookings', 'qrcode', 'qrCode'],
    ARRAY['public.bookings', 'refundamount', 'refundAmount'],
    ARRAY['public.bookings', 'cancellationreason', 'cancellationReason'],
    ARRAY['public.bookings', 'cancelledat', 'cancelledAt'],
    ARRAY['public.bookings', 'paymentstatus', 'paymentStatus'],
    ARRAY['public.bookings', 'createdat', 'createdAt'],
    ARRAY['public.todos', 'insertedat', 'insertedAt']
  ] LOOP
    table_name := mapping[1];
    legacy_column := mapping[2];
    current_column := mapping[3];

    IF to_regclass(table_name) IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM pg_attribute
        WHERE attrelid = table_name::regclass
          AND attname = legacy_column
          AND NOT attisdropped
      )
      AND EXISTS (
        SELECT 1 FROM pg_attribute
        WHERE attrelid = table_name::regclass
          AND attname = current_column
          AND NOT attisdropped
      )
    THEN
      SELECT format_type(atttypid, atttypmod)
      INTO current_type
      FROM pg_attribute
      WHERE attrelid = table_name::regclass
        AND attname = current_column
        AND NOT attisdropped;

      EXECUTE format(
        'UPDATE %s SET %I = COALESCE(%I, %I::%s) WHERE %I IS NULL AND %I IS NOT NULL',
        table_name,
        current_column,
        current_column,
        legacy_column,
        current_type,
        current_column,
        legacy_column
      );

      EXECUTE format('ALTER TABLE %s DROP COLUMN IF EXISTS %I CASCADE', table_name, legacy_column);
    END IF;
  END LOOP;

  IF to_regclass('public.trains') IS NOT NULL THEN
    ALTER TABLE public.trains DROP COLUMN IF EXISTS updatedat CASCADE;
  END IF;

  IF to_regclass('public.users') IS NOT NULL THEN
    ALTER TABLE public.users DROP COLUMN IF EXISTS updatedat CASCADE;
  END IF;

  IF to_regclass('public.stations') IS NOT NULL THEN
    ALTER TABLE public.stations DROP COLUMN IF EXISTS updatedat CASCADE;
  END IF;

  IF to_regclass('public.bookings') IS NOT NULL THEN
    ALTER TABLE public.bookings DROP COLUMN IF EXISTS updatedat CASCADE;
  END IF;
END $$;

-- API role privileges
-- RLS policies still control anon/authenticated access. service_role bypasses RLS,
-- but it still needs explicit database privileges on manually-created tables.
GRANT USAGE ON SCHEMA public TO service_role, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT SELECT ON public.trains, public.stations TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.todos TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO service_role;

-- Foreign-key relationships
DO $$
DECLARE
  bookings_user_type oid;
  users_id_type oid;
  bookings_train_type oid;
  trains_id_type oid;
BEGIN
  SELECT atttypid INTO bookings_user_type
  FROM pg_attribute
  WHERE attrelid = 'public.bookings'::regclass
    AND attname = 'user'
    AND NOT attisdropped;

  SELECT atttypid INTO users_id_type
  FROM pg_attribute
  WHERE attrelid = 'public.users'::regclass
    AND attname = 'id'
    AND NOT attisdropped;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bookings_user_fkey'
      AND conrelid = 'public.bookings'::regclass
  ) AND bookings_user_type = users_id_type THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_user_fkey FOREIGN KEY ("user") REFERENCES public.users(id) ON DELETE SET NULL;
  ELSIF bookings_user_type <> users_id_type THEN
    RAISE NOTICE 'Skipping bookings_user_fkey because bookings.user and users.id have different types.';
  END IF;

  SELECT atttypid INTO bookings_train_type
  FROM pg_attribute
  WHERE attrelid = 'public.bookings'::regclass
    AND attname = 'train'
    AND NOT attisdropped;

  SELECT atttypid INTO trains_id_type
  FROM pg_attribute
  WHERE attrelid = 'public.trains'::regclass
    AND attname = 'id'
    AND NOT attisdropped;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bookings_train_fkey'
      AND conrelid = 'public.bookings'::regclass
  ) AND bookings_train_type = trains_id_type THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_train_fkey FOREIGN KEY ("train") REFERENCES public.trains(id) ON DELETE SET NULL;
  ELSIF bookings_train_type <> trains_id_type THEN
    RAISE NOTICE 'Skipping bookings_train_fkey because bookings.train and trains.id have different types.';
  END IF;
END $$;

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
DROP POLICY IF EXISTS "Allow public read access to trains" ON public.trains;
CREATE POLICY "Allow public read access to trains" ON public.trains
  FOR SELECT TO public USING (true);

-- 3. stations: Public read access for everyone. Writes only by service_role (Node backend).
DROP POLICY IF EXISTS "Allow public read access to stations" ON public.stations;
CREATE POLICY "Allow public read access to stations" ON public.stations
  FOR SELECT TO public USING (true);

-- 4. bookings: Restrict public/anon reads or writes entirely. Access is managed by service_role.
-- No policies defined, meaning default deny for everyone except service_role.

-- 5. todos: Fully public CRUD access for frontend client demo (matches typical tutorial/demo needs).
DROP POLICY IF EXISTS "Allow public select on todos" ON public.todos;
CREATE POLICY "Allow public select on todos" ON public.todos FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow public insert on todos" ON public.todos;
CREATE POLICY "Allow public insert on todos" ON public.todos FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on todos" ON public.todos;
CREATE POLICY "Allow public update on todos" ON public.todos FOR UPDATE TO public USING (true);
DROP POLICY IF EXISTS "Allow public delete on todos" ON public.todos;
CREATE POLICY "Allow public delete on todos" ON public.todos FOR DELETE TO public USING (true);
