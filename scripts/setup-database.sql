-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS pokemon_team CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pokemon_team table
CREATE TABLE pokemon_team (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pokemon_id INTEGER NOT NULL,
  pokemon_name TEXT NOT NULL,
  pokemon_data JSONB NOT NULL,
  happiness INTEGER DEFAULT 50 CHECK (happiness >= 0 AND happiness <= 100),
  health INTEGER DEFAULT 100 CHECK (health >= 0 AND health <= 100),
  energy INTEGER DEFAULT 50 CHECK (energy >= 0 AND energy <= 100),
  hunger INTEGER DEFAULT 50 CHECK (hunger >= 0 AND hunger <= 100),
  activity_points INTEGER DEFAULT 0,
  total_actions INTEGER DEFAULT 0,
  is_mega_evolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_pokemon_team_user_id ON pokemon_team(user_id);
CREATE INDEX idx_pokemon_team_pokemon_id ON pokemon_team(pokemon_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pokemon_team ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for pokemon_team table
CREATE POLICY "Users can view own pokemon" ON pokemon_team
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pokemon" ON pokemon_team
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pokemon" ON pokemon_team
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pokemon" ON pokemon_team
  FOR DELETE USING (auth.uid() = user_id);

-- Verify tables were created successfully
SELECT 'Tables created successfully!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'pokemon_team');
