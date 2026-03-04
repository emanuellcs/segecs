const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * Listar todos os usuários com seus níveis de acesso
 */
const getUsuarios = async (req, res, next) => {
  try {
    const sql = `
      SELECT u.id_usuario, u.nome_completo, u.email, u.id_nivel, u.ativo, n.nivel as nome_nivel 
      FROM sys_usuarios u
      LEFT JOIN sys_niveis_acesso n ON u.id_nivel = n.id_nivel
      ORDER BY u.nome_completo ASC
    `;
    const resultado = await query(sql);
    res.json(resultado.rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Buscar usuário por ID
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT id_usuario, nome_completo, email, id_nivel, ativo FROM sys_usuarios WHERE id_usuario = $1',
      [id]
    );

    if (result.rows.length === 0) {
      const error = new Error('Usuário não encontrado');
      error.statusCode = 404;
      throw error;
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Criar um novo usuário
 */
const createUsuario = async (req, res, next) => {
  try {
    const { nome_completo, email, senha, id_nivel } = req.body;

    if (!nome_completo || !email || !senha || !id_nivel) {
      const error = new Error('Todos os campos são obrigatórios');
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(senha, salt);

    const sql = `
      INSERT INTO sys_usuarios (nome_completo, email, senha_hash, id_nivel, ativo)
      VALUES ($1, $2, $3, $4, true)
      RETURNING id_usuario, nome_completo, email, id_nivel
    `;

    const novo = await query(sql, [nome_completo, email, hash, id_nivel]);
    res.status(201).json(novo.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Atualizar um usuário existente
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome_completo, email, senha, id_nivel, ativo } = req.body;

    let sql;
    let params;

    if (senha && senha.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(senha, salt);
      sql = `
        UPDATE sys_usuarios 
        SET nome_completo=$1, email=$2, senha_hash=$3, id_nivel=$4, ativo=$5, dt_atualizacao=CURRENT_TIMESTAMP
        WHERE id_usuario=$6
        RETURNING id_usuario, nome_completo, email
      `;
      params = [nome_completo, email, hash, id_nivel, ativo, id];
    } else {
      sql = `
        UPDATE sys_usuarios 
        SET nome_completo=$1, email=$2, id_nivel=$3, ativo=$4, dt_atualizacao=CURRENT_TIMESTAMP
        WHERE id_usuario=$5
        RETURNING id_usuario, nome_completo, email
      `;
      params = [nome_completo, email, id_nivel, ativo, id];
    }

    const result = await query(sql, params);

    if (result.rowCount === 0) {
      const error = new Error('Usuário não encontrado');
      error.statusCode = 404;
      throw error;
    }

    res.json({ message: 'Usuário atualizado com sucesso!', user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Remover um usuário
 */
const deleteUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM sys_usuarios WHERE id_usuario = $1', [id]);

    if (result.rowCount === 0) {
      const error = new Error('Usuário não encontrado');
      error.statusCode = 404;
      throw error;
    }

    res.json({ message: 'Usuário removido com sucesso' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsuarios,
  getUserById,
  createUsuario,
  updateUser,
  deleteUsuario,
};
