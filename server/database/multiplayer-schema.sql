-- Multiplayer Schema for Durak Mini App
-- Supabase PostgreSQL

-- Table: multiplayer_games
CREATE TABLE IF NOT EXISTS multiplayer_games (
  id VARCHAR(50) PRIMARY KEY,
  host_telegram_id BIGINT NOT NULL,
  guest_telegram_id BIGINT,
  host_username VARCHAR(255),
  host_first_name VARCHAR(255),
  guest_username VARCHAR(255),
  guest_first_name VARCHAR(255),
  
  -- Game state
  status VARCHAR(20) DEFAULT 'waiting', -- 'waiting', 'playing', 'finished', 'abandoned'
  game_data JSONB DEFAULT '{}'::jsonb, -- полное состояние игры
  current_player_telegram_id BIGINT,
  phase VARCHAR(20) DEFAULT 'attacking', -- 'attacking', 'defending', 'adding'
  time_left INTEGER DEFAULT 10, -- секунд до окончания хода
  last_action_at TIMESTAMP DEFAULT NOW(),
  
  -- Game settings
  time_limit INTEGER DEFAULT 10, -- лимит времени на ход
  theme VARCHAR(50) DEFAULT 'casino',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  finished_at TIMESTAMP
);

-- Table: game_invites
CREATE TABLE IF NOT EXISTS game_invites (
  code VARCHAR(10) PRIMARY KEY,
  game_id VARCHAR(50) NOT NULL,
  from_telegram_id BIGINT NOT NULL,
  from_username VARCHAR(255),
  from_first_name VARCHAR(255),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (game_id) REFERENCES multiplayer_games(id) ON DELETE CASCADE
);

-- Table: game_history (расширенная для мультиплеера)
CREATE TABLE IF NOT EXISTS multiplayer_game_history (
  id SERIAL PRIMARY KEY,
  game_id VARCHAR(50) NOT NULL,
  winner_telegram_id BIGINT,
  loser_telegram_id BIGINT,
  duration INTEGER, -- длительность игры в секундах
  total_moves INTEGER DEFAULT 0,
  host_telegram_id BIGINT NOT NULL,
  guest_telegram_id BIGINT,
  theme VARCHAR(50),
  finished_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (game_id) REFERENCES multiplayer_games(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_multiplayer_games_status ON multiplayer_games(status);
CREATE INDEX IF NOT EXISTS idx_multiplayer_games_host ON multiplayer_games(host_telegram_id);
CREATE INDEX IF NOT EXISTS idx_multiplayer_games_guest ON multiplayer_games(guest_telegram_id);
CREATE INDEX IF NOT EXISTS idx_multiplayer_games_created ON multiplayer_games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_invites_code ON game_invites(code);
CREATE INDEX IF NOT EXISTS idx_game_invites_expires ON game_invites(expires_at);
CREATE INDEX IF NOT EXISTS idx_multiplayer_history_game ON multiplayer_game_history(game_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_multiplayer_games_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_multiplayer_games_updated_at ON multiplayer_games;
CREATE TRIGGER update_multiplayer_games_updated_at 
  BEFORE UPDATE ON multiplayer_games
  FOR EACH ROW EXECUTE FUNCTION update_multiplayer_games_updated_at();

-- View: Available games for lobby
CREATE OR REPLACE VIEW available_games AS
SELECT 
  id,
  host_telegram_id,
  host_username,
  host_first_name,
  theme,
  time_limit,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at)) as wait_time_seconds
FROM multiplayer_games
WHERE status = 'waiting' 
  AND guest_telegram_id IS NULL
  AND created_at > NOW() - INTERVAL '10 minutes' -- игры старше 10 минут удаляются
ORDER BY created_at ASC;

-- View: Player multiplayer stats
CREATE OR REPLACE VIEW player_multiplayer_stats AS
SELECT 
  ps.telegram_user_id,
  ps.username,
  ps.first_name,
  COUNT(mgh.id) as total_multiplayer_games,
  COUNT(CASE WHEN mgh.winner_telegram_id = ps.telegram_user_id THEN 1 END) as multiplayer_wins,
  COUNT(CASE WHEN mgh.loser_telegram_id = ps.telegram_user_id THEN 1 END) as multiplayer_losses,
  ROUND(
    COUNT(CASE WHEN mgh.winner_telegram_id = ps.telegram_user_id THEN 1 END)::numeric / 
    NULLIF(COUNT(mgh.id), 0) * 100, 2
  ) as multiplayer_win_rate,
  AVG(mgh.duration) as avg_game_duration,
  MAX(mgh.finished_at) as last_multiplayer_game
FROM player_stats ps
LEFT JOIN multiplayer_game_history mgh ON (
  mgh.host_telegram_id = ps.telegram_user_id OR 
  mgh.guest_telegram_id = ps.telegram_user_id
)
GROUP BY ps.telegram_user_id, ps.username, ps.first_name;
