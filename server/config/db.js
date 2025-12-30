const { Pool } = require('pg');
const dotenv = require('dotenv');

// Carrega as variáveis do arquivo .env
dotenv.config();

// --- INÍCIO DO DIAGNÓSTICO (O ESPIÃO) ---
console.log("==========================================");
console.log("🔍 DIAGNÓSTICO DE CONEXÃO COM O BANCO");
console.log("Arquivo .env carregado?");
console.log("HOST:", process.env.DB_HOST || 'localhost (padrão)');
console.log("USER:", process.env.DB_USER || 'postgres (padrão)');
console.log("DB:", process.env.DB_NAME || 'segecs_db (padrão)');
// A linha abaixo vai mostrar sua senha no terminal para conferirmos se há espaços extras ou erro
console.log("SENHA LIDA:", process.env.DB_PASSWORD ? `'${process.env.DB_PASSWORD}'` : "❌ NENHUMA (UNDEFINED)");
console.log("==========================================");
// --- FIM DO DIAGNÓSTICO ---

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD, // Aqui é onde ele usa a senha
  database: process.env.DB_NAME || 'segecs_db',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Database connection established');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle database client', err);
  process.exit(-1);
});

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // console.log('Executed query', { text, duration, rows: res.rowCount }); // Comentei para limpar o log
    return res;
  } catch (error) {
    console.error('Database query error', { text, error: error.message });
    throw error;
  }
};

// Helper function to get a client from the pool (for transactions)
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  
  // Set a timeout of 5 seconds
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
  }, 5000);
  
  // Monkey patch the query method to log the query when a client is checked out
  client.query = (...args) => {
    client.lastQuery = args;
    return query(...args);
  };
  
  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release();
  };
  
  return client;
};

module.exports = {
  pool,
  query,
  getClient,
};
