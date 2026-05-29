-- Supabase / Postgres schema for RailAxis
-- Run this in the Supabase SQL editor (SQL > New query) and execute.

-- USERS (fields match backend model: camelCase)
CREATE TABLE IF NOT EXISTS public.users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'user',
  phone text,
  isActive boolean DEFAULT true,
  lastLogin timestamptz,
  createdAt timestamptz DEFAULT now()
);

-- TRAINS
CREATE TABLE IF NOT EXISTS public.trains (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  trainNumber text,
  trainName text,
  source text,
  destination text,
  departureTime text,
  arrivalTime text,
  duration text,
  totalSeats integer,
  availableSeats integer,
  trainType text,
  baseFare numeric,
  classes jsonb,
  daysOfOperation text[],
  distance integer,
  amenities text[],
  rating numeric,
  isActive boolean DEFAULT true,
  createdAt timestamptz DEFAULT now()
);

-- STATIONS
CREATE TABLE IF NOT EXISTS public.stations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text,
  code text,
  city text,
  state text,
  platforms integer,
  isActive boolean DEFAULT true,
  createdAt timestamptz DEFAULT now()
);

-- BOOKINGS (fields use camelCase to match backend model)
CREATE TABLE IF NOT EXISTS public.bookings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "user" bigint,
  "train" bigint,
  pnrNumber text UNIQUE,
  trainSnapshot jsonb,
  passengers jsonb,
  contactInfo jsonb,
  journeyDate date,
  seatClass text,
  baseFare numeric,
  taxes numeric,
  totalFare numeric,
  status text DEFAULT 'Confirmed',
  qrCode text,
  refundAmount numeric,
  cancellationReason text,
  cancelledAt timestamptz,
  paymentStatus text,
  createdAt timestamptz DEFAULT now()
);

-- TODOS (demo table for frontend)
CREATE TABLE IF NOT EXISTS public.todos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text,
  done boolean DEFAULT false,
  insertedAt timestamptz DEFAULT now()
);

-- Optional: add foreign-key relationships (use quoted column names for camelCase)
ALTER TABLE IF EXISTS public.bookings
  ADD CONSTRAINT bookings_user_fkey FOREIGN KEY ("user") REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.bookings
  ADD CONSTRAINT bookings_train_fkey FOREIGN KEY ("train") REFERENCES public.trains(id) ON DELETE SET NULL;

-- Notes:
-- - The backend code uses camelCase field names (e.g., `createdAt`, `isActive`, `pnrNumber`, `user`, `train`).
-- - Run this SQL in Supabase SQL editor to create tables.
-- - After creating tables, run the backend seeder to populate sample data:
--     cd backend
--     npm run seed
