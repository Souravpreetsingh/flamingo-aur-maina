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
(1, 'Oceanfront Suite', 'Suite with private balcony and ocean view, king bed, marble bathroom.', 9999, 2, 'https://images.unsplash.com/photo-1590490360182-c33d57733427', 'Suite'),
(2, 'Penthouse Loft', 'Modern penthouse with panoramic city views, full kitchen, jacuzzi.', 18999, 4, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9', 'Penthouse'),
(3, 'Garden Villa', 'Private garden villa, pet-friendly, indoor-outdoor living.', 11999, 3, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', 'Villa'),
(4, 'Royal Suite', 'Pinnacle of luxury with separate living, dining, butler service, grand terrace.', 25999, 4, 'https://images.unsplash.com/photo-1582719508461-905c673771fd', 'Suite'),
(5, 'Cozy Studio', 'Compact studio for solo travelers with workspace and kitchenette.', 4499, 1, 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9', 'Studio'),
(6, 'Family Suite', 'Two-bedroom suite with kids play area, full kitchen, living room.', 15499, 6, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a', 'Suite')
ON CONFLICT (id) DO NOTHING;
