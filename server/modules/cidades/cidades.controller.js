const { query } = require('../../shared/config/db');

/**
 * Listar todas as cidades
 */
const getCidades = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM cad_cidades ORDER BY cidade ASC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Criar nova cidade
 */
const createCidade = async (req, res, next) => {
  try {
    const { cidade, uf, observacoes } = req.body;

    const sql = 'INSERT INTO cad_cidades (cidade, uf, observacoes) VALUES ($1, $2, $3) RETURNING *';
    const result = await query(sql, [cidade, uf, observacoes]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Atualizar cidade
 */
const updateCidade = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cidade, uf, observacoes } = req.body;

    const sql = `
      UPDATE cad_cidades 
      SET cidade = $1, uf = $2, observacoes = $3, dt_atualizacao = CURRENT_TIMESTAMP 
      WHERE id_cidade = $4
      RETURNING *
    `;
    const result = await query(sql, [cidade, uf, observacoes, id]);

    if (result.rowCount === 0) {
      const error = new Error('Cidade não encontrada');
      error.statusCode = 404;
      throw error;
    }

    res.json({ message: 'Cidade atualizada com sucesso!', cidade: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Remover cidade
 */
const deleteCidade = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM cad_cidades WHERE id_cidade = $1', [id]);

    if (result.rowCount === 0) {
      const error = new Error('Cidade não encontrada');
      error.statusCode = 404;
      throw error;
    }

    res.json({ message: 'Cidade removida com sucesso!' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCidades,
  createCidade,
  updateCidade,
  deleteCidade,
};
