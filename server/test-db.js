const { query } = require('./database/db');

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Проверяем существование таблиц
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%multiplayer%' OR table_name LIKE '%game%'
    `);
    
    console.log('📊 Found tables:', tables.rows.map(r => r.table_name));
    
    // Проверяем таблицу multiplayer_games
    try {
      const games = await query('SELECT COUNT(*) FROM multiplayer_games');
      console.log('✅ multiplayer_games table exists, count:', games.rows[0].count);
    } catch (error) {
      console.log('❌ multiplayer_games table does not exist:', error.message);
    }
    
    // Проверяем таблицу game_invites
    try {
      const invites = await query('SELECT COUNT(*) FROM game_invites');
      console.log('✅ game_invites table exists, count:', invites.rows[0].count);
    } catch (error) {
      console.log('❌ game_invites table does not exist:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabase();
