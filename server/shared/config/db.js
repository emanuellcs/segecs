const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'segecs_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(poolConfig);

// Função de consulta com lógica de retry simples
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('❌ Erro na consulta ao banco de dados:', { text, error: error.message });
    throw error;
  }
};

// Lógica de verificação de conexão com retentativas
const checkConnection = async (retries = 5) => {
  while (retries) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
      return;
    } catch (err) {
      retries -= 1;
      console.log(`⚠️ Aguardando banco de dados... (${retries} tentativas restantes)`);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
  console.error('🛑 Não foi possível conectar ao banco de dados após várias tentativas.');
  process.exit(1);
};

checkConnection();

module.exports = {
  pool,
  query,
};
