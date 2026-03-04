const { query } = require('../config/db');

/**
 * Listar todos os responsáveis
 */
const getResponsaveis = async (req, res, next) => {
  try {
    const todos = await query(`
      SELECT r.*, c.cidade, c.uf 
      FROM cad_responsaveis r
      LEFT JOIN cad_cidades c ON r.id_cidade = c.id_cidade
      ORDER BY r.id_responsavel ASC
    `);
    res.json(todos.rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Criar novo responsável
 */
const createResponsavel = async (req, res, next) => {
  try {
    const { nome, rg, cpf, telefone, id_cidade, bairro, observacoes } = req.body;

    if (!nome || !cpf) {
      const error = new Error('Campos obrigatórios: nome e CPF.');
      error.statusCode = 400;
      throw error;
    }

    const sql = `
      INSERT INTO cad_responsaveis (nome, rg, cpf, telefone, id_cidade, bairro, observacoes)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;

    const result = await query(sql, [nome, rg, cpf, telefone, id_cidade, bairro, observacoes]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Atualizar responsável
 */
const updateResponsavel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, rg, cpf, telefone, id_cidade, bairro, observacoes } = req.body;

    const sql = `
      UPDATE cad_responsaveis
      SET nome = $1, rg = $2, cpf = $3, telefone = $4, id_cidade = $5, 
          bairro = $6, observacoes = $7, dt_atualizacao = CURRENT_TIMESTAMP
      WHERE id_responsavel = $8
      RETURNING *
    `;

    const result = await query(sql, [nome, rg, cpf, telefone, id_cidade, bairro, observacoes, id]);

    if (result.rowCount === 0) {
      const error = new Error('Responsável não encontrado');
      error.statusCode = 404;
      throw error;
    }

    res.json({ message: 'Responsável atualizado com sucesso!', responsavel: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Remover responsável
 */
const deleteResponsavel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM cad_responsaveis WHERE id_responsavel = $1', [id]);

    if (result.rowCount === 0) {
      const error = new Error('Responsável não encontrado');
      error.statusCode = 404;
      throw error;
    }

    res.json({ message: 'Responsável excluído com sucesso!' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getResponsaveis,
  createResponsavel,
  updateResponsavel,
  deleteResponsavel,
};
