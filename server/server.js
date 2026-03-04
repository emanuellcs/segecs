require('dotenv').config();
const bcrypt = require('bcryptjs');
const express = require('express');
const cors = require('cors');

// Nota: O dotenv já foi carregado na linha 1, não precisa carregar de novo
const { query } = require('./config/db'); 

// ########## IMPORTAÇÃO DAS ROTAS ########## //
const niveisRoutes = require('./routes/niveisRoutes');
const alunosRoutes = require('./routes/alunosRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const cursosRoutes = require('./routes/cursosRoutes');
const escolasRoutes = require('./routes/escolasRoutes');
const responsaveisRoutes = require('./routes/responsaveisRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { authenticateToken } = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');

// --- 2. ROTA DE SETUP (CRIA O ADMIN) ---
// Coloquei aqui antes das rotas da API para ficar fácil de achar
app.get('/setup-admin', async (req, res) => {
  try {
    console.log("--> Tentando criar Admin...");

    // 1. Garante nível Admin (ID 1)
    await query(
      "INSERT INTO sys_niveis_acesso (id_nivel, nivel) VALUES (1, 'Administrador') ON CONFLICT (id_nivel) DO NOTHING"
    );

    // 2. Criptografa senha
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // 3. Insere Usuário
    await query(
      `INSERT INTO sys_usuarios (id_nivel, nome_completo, email, senha_hash, ativo) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (email) DO NOTHING`,
      [1, 'Administrador do Sistema', 'admin@segecs.com', hashedPassword, true]
    );
    
    console.log("--> Admin criado/verificado com sucesso!");
    res.send("✅ Admin verificado/criado com sucesso!<br>Login: admin@segecs.com<br>Senha: 123456");
  } catch (err) {
    console.error("--> ERRO:", err);
    res.status(500).send(`Erro ao criar admin: ${err.message}`);
  }
});

// --- ROTAS DA API ---
app.use('/api/auth', authRoutes); // Pública

// Rotas Protegidas
app.use('/api/niveis', authenticateToken, niveisRoutes);
app.use('/api/alunos', authenticateToken, alunosRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/usuarios', authenticateToken, usuariosRoutes);
app.use('/api/cidades', authenticateToken, require('./routes/cidadesRoutes'));
app.use('/api/cursos', authenticateToken, cursosRoutes);
app.use('/api/escolas', authenticateToken, escolasRoutes);
app.use('/api/responsaveis', authenticateToken, responsaveisRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'SEGECS API está funcionando!' });
});

// Health check route
app.get('/api/health', async (req, res) => {
  try {
    const result = await query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      database: 'Connected',
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'Disconnected',
      error: error.message 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

// Global Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
