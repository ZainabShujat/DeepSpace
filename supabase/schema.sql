-- Supabase schema for DeepSpace collaborative study rooms

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (app-level profile)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  layout TEXT NOT NULL DEFAULT 'metro', -- metro | cafe | library
  visibility TEXT NOT NULL DEFAULT 'public', -- public | private
  max_members INTEGER DEFAULT 6,
  mode TEXT NOT NULL DEFAULT 'endless',
  invite_code TEXT UNIQUE,
  share_code TEXT UNIQUE,
  extra_seats INTEGER DEFAULT 0,
  extra_tables INTEGER DEFAULT 0,
  extra_shelves INTEGER DEFAULT 0,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  owner_username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Room members (who joined a room)
CREATE TABLE IF NOT EXISTS room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  username TEXT NOT NULL,
  avatar TEXT,
  seat_id TEXT,
  status TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session tracking (focus sessions inside a room)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER -- optional: calculate when ended
);

-- Messages / chat inside a room
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log (audit/history)
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session history records for completed sessions
CREATE TABLE IF NOT EXISTS session_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  room_name TEXT,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  members JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_sessions_room_id ON sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_rooms_owner_id ON rooms(owner_id);

-- Example helper: compute duration when ending a session (can be used in triggers/app logic)
-- This schema file focuses on table structure; triggers/functions can be added later as needed.
