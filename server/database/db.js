const { Pool } = require('pg');

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.PGURL,
  ssl: {
    rejectUnauthorized: false // Railway требует SSL, но без проверки сертификата
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Увеличен таймаут до 10 секунд
  statement_timeout: 30000, // Таймаут выполнения запроса
  query_timeout: 30000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Helper function to execute queries
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query executed:', { text: text.substring(0, 50) + '...', duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
}

// Initialize database (create tables if not exist)
async function initializeDatabase() {
  const fs = require('fs');
  const path = require('path');
  
  try {
    console.log('🔄 Initializing database...');
    
    // Проверяем переменные окружения
    if (!process.env.DATABASE_URL && !process.env.PGURL) {
      console.warn('⚠️ DATABASE_URL not set, database features will be disabled');
      return false;
    }
    
    console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    console.log('🔍 PGURL:', process.env.PGURL ? 'Set' : 'Not set');
    
    // Проверяем подключение
    console.log('🔌 Testing database connection...');
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful:', testResult.rows[0].now);
    
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('📄 Reading schema.sql...');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      console.log('📝 Executing schema...');
      await pool.query(schema);
      console.log('✅ Database schema initialized successfully');
    } else {
      console.warn('⚠️ schema.sql not found, skipping initialization');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    console.error('❌ Error details:', error.message);
    console.warn('⚠️ Database features will be disabled, but app will continue');
    return false;
  }
}

module.exports = {
  query,
  pool,
  initializeDatabase,
};

