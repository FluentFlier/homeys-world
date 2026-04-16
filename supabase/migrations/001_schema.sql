-- Homeys World Database Schema
-- Run this in your InsForge SQL editor to set up the database

-- Cities table
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  neighborhoods TEXT[] NOT NULL DEFAULT '{}',
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  listing_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Listings table
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  city_id UUID REFERENCES cities(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('room_available','apartment_available','looking_for_room','looking_for_roommate')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  monthly_rent INTEGER,
  move_in_date DATE,
  move_out_date DATE,
  neighborhood TEXT,
  bedrooms NUMERIC,
  bathrooms NUMERIC,
  amenities TEXT[] DEFAULT '{}',
  photo_urls TEXT[] DEFAULT '{}',
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  contact_social TEXT,
  poster_first_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '60 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- City requests table
CREATE TABLE city_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name TEXT NOT NULL,
  country TEXT,
  requester_email TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Listing reports table
CREATE TABLE listing_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  reporter_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX listings_city_active_idx ON listings (city_id, is_active, created_at DESC);
CREATE INDEX listings_type_idx ON listings (type);
CREATE INDEX listings_neighborhood_idx ON listings (neighborhood);
CREATE INDEX listings_expires_idx ON listings (expires_at) WHERE is_active = true;
CREATE INDEX listings_user_id_idx ON listings (user_id);

-- Trigger: auto-update listing_count on cities
CREATE OR REPLACE FUNCTION update_city_listing_count()
RETURNS trigger AS $$
BEGIN
  IF tg_op = 'INSERT' THEN
    UPDATE cities SET listing_count = listing_count + 1 WHERE id = new.city_id;
  ELSIF tg_op = 'DELETE' THEN
    UPDATE cities SET listing_count = listing_count - 1 WHERE id = old.city_id;
  ELSIF tg_op = 'UPDATE' AND old.is_active != new.is_active THEN
    IF new.is_active THEN
      UPDATE cities SET listing_count = listing_count + 1 WHERE id = new.city_id;
    ELSE
      UPDATE cities SET listing_count = listing_count - 1 WHERE id = new.city_id;
    END IF;
  END IF;
  RETURN null;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listing_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON listings
FOR EACH ROW EXECUTE FUNCTION update_city_listing_count();

-- RPC: increment view count
CREATE OR REPLACE FUNCTION increment_view_count(p_listing_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE listings SET view_count = view_count + 1 WHERE id = p_listing_id;
END;
$$ LANGUAGE plpgsql;

-- RPC: expire old listings (run via cron)
CREATE OR REPLACE FUNCTION expire_old_listings()
RETURNS void AS $$
BEGIN
  UPDATE listings SET is_active = false WHERE is_active = true AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Row Level Security
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are public" ON cities FOR SELECT USING (is_active = true);
CREATE POLICY "Active listings are public" ON listings FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create own listings" ON listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own listings" ON listings FOR UPDATE USING (true);
CREATE POLICY "Users can delete own listings" ON listings FOR DELETE USING (true);
CREATE POLICY "Anyone can request a city" ON city_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can report a listing" ON listing_reports FOR INSERT WITH CHECK (true);
