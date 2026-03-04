require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { query } = require('./shared/config/db');

// Middlewares Compartilhados
const { authenticateToken } = require('./shared/middleware/authMiddleware');
const errorHandler = require('./shared/middleware/errorHandler');

// Módulos (Features)
const authRoutes = require('./modules/auth/auth.routes');
const niveisRoutes = require('./modules/niveis/niveis.routes');
const alunosRoutes = require('./modules/alunos/alunos.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const usuariosRoutes = require('./modules/usuarios/usuarios.routes');
const cidadesRoutes = require('./modules/cidades/cidades.routes');
const cursosRoutes = require('./modules/cursos/cursos.routes');
const escolasRoutes = require('./modules/escolas/escolas.routes');
const responsaveisRoutes = require('./modules/responsaveis/responsaveis.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ROTAS DA API ---
app.use('/api/auth', authRoutes); // Pública

// Rotas Protegidas (Requiere Token)
app.use('/api/niveis', authenticateToken, niveisRoutes);
app.use('/api/alunos', authenticateToken, alunosRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/usuarios', authenticateToken, usuariosRoutes);
app.use('/api/cidades', authenticateToken, cidadesRoutes);
app.use('/api/cursos', authenticateToken, cursosRoutes);
app.use('/api/escolas', authenticateToken, escolasRoutes);
app.use('/api/responsaveis', authenticateToken, responsaveisRoutes);

// Health check route
app.get('/api/health', async (req, res) => {
  try {
    const result = await query('SELECT NOW()');
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: error.message,
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

// Global Error handling middleware (Deve ser o último)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 Modular Architecture: Industrial Grade Activated`);
});

module.exports = app;
