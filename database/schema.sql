-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    platform VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    endpoint VARCHAR(255),
    voucher_type VARCHAR(100),
    voucher_price_point VARCHAR(50),
    price VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- IGN checks history
CREATE TABLE IF NOT EXISTS ign_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    game_id INTEGER,
    ign VARCHAR(255),
    user_input JSON, -- Store game-specific input (uid, zone, etc.)
    is_available BOOLEAN,
    response_data JSON, -- Store full response
    checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);

-- API usage statistics
CREATE TABLE IF NOT EXISTS api_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint VARCHAR(255),
    method VARCHAR(10),
    status_code INTEGER,
    response_time INTEGER, -- in milliseconds
    user_id INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier VARCHAR(255), -- IP or user_id
    endpoint VARCHAR(255),
    count INTEGER DEFAULT 1,
    window_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(identifier, endpoint)
);

-- Insert default games
INSERT OR REPLACE INTO games (name, code, description, platform, voucher_type, voucher_price_point, price) VALUES
('Mobile Legends: Bang Bang', 'mlbb', 'Game MOBA mobile populer', 'Mobile', 'MOBILE_LEGENDS', '27684', '527250'),
('Genshin Impact', 'genshin', 'Action RPG', 'Mobile/PC', 'GENSHIN_IMPACT', '116054', '16500'),
('PUBG Mobile', 'pubg-mobile', 'Battle royale mobile', 'Mobile', 'PUBG_MOBILE', '194305', '16500'),
('Free Fire', 'free-fire', 'Battle royale mobile', 'Mobile', 'FREE_FIRE', '46741', '16500'),
('Call of Duty Mobile', 'cod-mobile', 'FPS mobile', 'Mobile', 'CALL_OF_DUTY_MOBILE', '242461', '16500'),
('Valorant', 'valorant', 'FPS PC', 'PC', 'VALORANT', '297513', '105000'),
('League of Legends', 'lol', 'MOBA PC', 'PC', 'LEAGUE_OF_LEGENDS', '59721', '105000'),
('Dota 2', 'dota2', 'MOBA PC', 'PC', 'DOTA2', '99999', '105000'),
('Counter-Strike 2', 'cs2', 'FPS PC', 'PC', 'COUNTER_STRIKE', '99999', '105000'),
('Apex Legends', 'apex', 'Battle royale', 'PC/Mobile', 'APEX_LEGENDS', '99999', '105000'),
('Fortnite', 'fortnite', 'Battle royale', 'PC/Mobile', 'FORTNITE', '99999', '105000'),
('Minecraft', 'minecraft', 'Sandbox game', 'PC/Mobile', 'MINECRAFT', '99999', '105000'),
('Roblox', 'roblox', 'Platform game', 'PC/Mobile', 'ROBLOX', '99999', '105000'),
('FIFA Mobile', 'fifa-mobile', 'Sports mobile', 'Mobile', 'FIFA_MOBILE', '99999', '16500'),
('eFootball', 'efootball', 'Sports mobile', 'Mobile', 'EFOOTBALL', '99999', '16500');