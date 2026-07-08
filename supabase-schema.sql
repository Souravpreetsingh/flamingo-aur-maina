-- LuxeStay Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- Then run the seed query below separately.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT DEFAULT '',
    pwd_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
    id BIGINT PRIMARY KEY,
    room_name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price NUMERIC NOT NULL,
    capacity INTEGER NOT NULL,
    image_url TEXT DEFAULT '',
    room_type TEXT DEFAULT ''
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES public.rooms(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    booking_status TEXT DEFAULT 'CONFIRMED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);

-- Enable Row Level Security (optional, we use service_role key server-side)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow anon read access to rooms (public data)
CREATE POLICY "Rooms are public" ON public.rooms FOR SELECT USING (true);

-- Allow service_role full access (this is the default, but explicit is better)
-- Note: RLS policies below are for if you ever use the anon key directly

-- Seed rooms data
INSERT INTO public.rooms (id, room_name, description, price, capacity, image_url, room_type) VALUES
(1, 'Flamingo 1', 'Spacious duplex room for 4 persons with mountain views, private balcony, and modern amenities.', 6000, 4, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', 'Duplex'),
(2, 'Flamingo 2', 'King attic room for 4 persons with warm wooden interiors and panoramic valley views.', 5000, 4, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32', 'King Attic'),
(3, 'Flamingo 3', 'Duplex room for 4 persons set in a serene apple orchard with stunning mountain views.', 6000, 4, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', 'Duplex'),
(4, 'Maina 1', 'Cozy private room for 2 persons with warm wooden interiors and mountain charm.', 2500, 2, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', 'Private Room'),
(5, 'Maina 2', 'Budget-friendly private room for 2 persons with essential comforts and mountain access.', 2000, 2, 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9', 'Private Room'),
(6, 'Maina 3', 'Charming private room for 2 persons with orchard views and warm hospitality.', 2500, 2, 'https://images.unsplash.com/photo-1598928506311-c55ez637a11a', 'Private Room')
ON CONFLICT (id) DO NOTHING;
