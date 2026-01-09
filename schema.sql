-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color_primary TEXT NOT NULL,
  color_secondary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  opponent_team_id UUID REFERENCES teams(id),
  stadium TEXT NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  result_type TEXT CHECK (result_type IN ('win', 'loss', 'draw')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game stats table
CREATE TABLE IF NOT EXISTS game_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  -- Batting stats
  ab INTEGER DEFAULT 0,
  h INTEGER DEFAULT 0,
  rbi INTEGER DEFAULT 0,
  hr INTEGER DEFAULT 0,
  sb INTEGER DEFAULT 0,
  -- Pitching stats
  ip DECIMAL(4,1) DEFAULT 0,
  np INTEGER DEFAULT 0,
  h_allowed INTEGER DEFAULT 0,
  so INTEGER DEFAULT 0,
  bb INTEGER DEFAULT 0,
  er INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, player_id)
);

-- User attendance table (for tracking which games the user attended)
CREATE TABLE IF NOT EXISTS user_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_games_date ON games(date);
CREATE INDEX IF NOT EXISTS idx_game_stats_game_id ON game_stats(game_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_player_id ON game_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_user_attendance_user_id ON user_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_user_attendance_game_id ON user_attendance(game_id);
