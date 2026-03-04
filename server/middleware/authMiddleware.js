const jwt = require('jsonwebtoken');

/**
 * Middleware para validar o token JWT nas requisições
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acesso negado. Token não fornecido.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Token inválido ou expirado.',
    });
  }
};

/**
 * Middleware para validar níveis de acesso específicos
 * @param {Array} allowedLevels IDs dos níveis permitidos
 */
const authorizeLevels = (allowedLevels) => {
  return async (req, res, next) => {
    try {
      // O req.user contém apenas o ID vindo do token
      const { query } = require('../config/db');
      const result = await query('SELECT id_nivel FROM sys_usuarios WHERE id_usuario = $1', [
        req.user.id,
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
      }

      const userLevel = result.rows[0].id_nivel;

      if (!allowedLevels.includes(userLevel)) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem permissão para acessar este recurso.',
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  authenticateToken,
  authorizeLevels,
};
