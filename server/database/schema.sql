-- Schema for Player Statistics Database
-- PostgreSQL

-- Table: player_stats
CREATE TABLE IF NOT EXISTS player_stats (
  id SERIAL PRIMARY KEY,
  telegram_user_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  
  -- Basic stats
  total_games INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_result VARCHAR(10),
  
  -- Achievement data (JSON)
  achievements JSONB DEFAULT '{"unlocked": [], "points": 0, "level": 1, "title": "Новичок"}'::jsonb,
  
  -- Detailed stats (JSON)
  detailed_stats JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_game_at TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_telegram_user_id ON player_stats(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_updated_at ON player_stats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_total_games ON player_stats(total_games DESC);

-- Table: game_history (optional - for detailed game logs)
CREATE TABLE IF NOT EXISTS game_history (
  id SERIAL PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL,
  result VARCHAR(10) NOT NULL, -- 'win' or 'loss'
  duration INTEGER, -- game duration in seconds
  cards_played INTEGER,
  theme VARCHAR(50),
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (telegram_user_id) REFERENCES player_stats(telegram_user_id) ON DELETE CASCADE
);

-- Index for game history
CREATE INDEX IF NOT EXISTS idx_game_history_user ON game_history(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_game_history_played_at ON game_history(played_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_player_stats_updated_at BEFORE UPDATE ON player_stats
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View: Top players by wins
CREATE OR REPLACE VIEW top_players AS
SELECT 
  telegram_user_id,
  username,
  first_name,
  total_games,
  wins,
  losses,
  ROUND((wins::numeric / NULLIF(total_games, 0) * 100), 2) as win_rate,
  best_streak,
  (achievements->>'level')::integer as level,
  (achievements->>'points')::integer as points
FROM player_stats
WHERE total_games > 0
ORDER BY wins DESC, win_rate DESC
LIMIT 100;

-- View: Recent games
CREATE OR REPLACE VIEW recent_games AS
SELECT 
  gh.id,
  gh.telegram_user_id,
  ps.username,
  ps.first_name,
  gh.result,
  gh.duration,
  gh.cards_played,
  gh.theme,
  gh.played_at
FROM game_history gh
JOIN player_stats ps ON gh.telegram_user_id = ps.telegram_user_id
ORDER BY gh.played_at DESC
LIMIT 100;

