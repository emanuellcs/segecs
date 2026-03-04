const { query } = require('../../shared/config/db');

/**
 * Listar todos os níveis de acesso
 */
const getNiveis = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM sys_niveis_acesso ORDER BY id_nivel ASC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Buscar nível por ID
 */
const getNivelById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM sys_niveis_acesso WHERE id_nivel = $1', [id]);

    if (result.rows.length === 0) {
      const error = new Error('Nível não encontrado');
      error.statusCode = 404;
      throw error;
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Criar novo nível
 */
const createNivel = async (req, res, next) => {
  try {
    const { nivel, descricao } = req.body;

    const sql = 'INSERT INTO sys_niveis_acesso (nivel, descricao) VALUES ($1, $2) RETURNING *';
    const result = await query(sql, [nivel, descricao]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Atualizar nível
 */
const updateNivel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nivel, descricao } = req.body;

    const sql = `
      UPDATE sys_niveis_acesso 
      SET nivel = $1, descricao = $2, dt_atualizacao = CURRENT_TIMESTAMP 
      WHERE id_nivel = $3
      RETURNING *
    `;
    const result = await query(sql, [nivel, descricao, id]);

    if (result.rowCount === 0) {
      const error = new Error('Nível não encontrado');
      error.statusCode = 404;
      throw error;
    }

    res.json({ message: 'Nível atualizado com sucesso!', nivel: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Remover nível
 */
const deleteNivel = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar se existem usuários vinculados
    const checkUsers = await query('SELECT count(*) FROM sys_usuarios WHERE id_nivel = $1', [id]);
    if (parseInt(checkUsers.rows[0].count) > 0) {
      const error = new Error('Proibido excluir: Existem usuários vinculados a este nível.');
      error.statusCode = 400;
      throw error;
    }

    const result = await query('DELETE FROM sys_niveis_acesso WHERE id_nivel = $1', [id]);

    if (result.rowCount === 0) {
      const error = new Error('Nível não encontrado');
      error.statusCode = 404;
      throw error;
    }

    res.json({ message: 'Nível removido com sucesso!' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNiveis,
  getNivelById,
  createNivel,
  updateNivel,
  deleteNivel,
};
