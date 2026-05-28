-- Add profiles table for storing username and avatar linked to auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE,
  avatar TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- If you want to copy existing users -> profiles, you can add a query here.
