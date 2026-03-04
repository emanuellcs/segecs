const { query } = require('../config/db');

/**
 * Listar todas as escolas
 */
const getEscolas = async (req, res, next) => {
  try {
    const todas = await query(`
      SELECT e.*, c.cidade, c.uf 
      FROM cad_escolas e
      LEFT JOIN cad_cidades c ON e.id_cidade = c.id_cidade
      ORDER BY e.id_escola ASC
    `);
    res.json(todas.rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Criar nova escola
 */
const createEscola = async (req, res, next) => {
  try {
    const { nome_escola, inep, id_cidade, uf, endereco_escola, telefone, email, observacoes } = req.body;

    if (!nome_escola || !inep) {
      const error = new Error('Campos obrigatórios: nome da escola e INEP.');
      error.statusCode = 400;
      throw error;
    }

    const sql = `
      INSERT INTO cad_escolas (nome_escola, inep, id_cidade, uf, endereco_escola, telefone, email, observacoes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `;
    
    const result = await query(sql, [nome_escola, inep, id_cidade, uf, endereco_escola, telefone, email, observacoes]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Atualizar escola
 */
const updateEscola = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome_escola, inep, id_cidade, uf, endereco_escola, telefone, email, observacoes } = req.body;

    const sql = `
      UPDATE cad_escolas
      SET nome_escola = $1, inep = $2, id_cidade = $3, uf = $4, endereco_escola = $5, 
          telefone = $6, email = $7, observacoes = $8, dt_atualizacao = CURRENT_TIMESTAMP
      WHERE id_escola = $9
      RETURNING *
    `;

    const result = await query(sql, [nome_escola, inep, id_cidade, uf, endereco_escola, telefone, email, observacoes, id]);

    if (result.rowCount === 0) {
      const error = new Error('Escola não encontrada');
      error.statusCode = 404;
      throw error;
    }

    res.json({ message: "Escola atualizada com sucesso!", escola: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Remover escola
 */
const deleteEscola = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM cad_escolas WHERE id_escola = $1", [id]);
    
    if (result.rowCount === 0) {
      const error = new Error('Escola não encontrada');
      error.statusCode = 404;
      throw error;
    }
    
    res.json({ message: "Escola excluída com sucesso!" });
  } catch (err) {
    next(err);
  }
};

module.exports = { 
  getEscolas, 
  createEscola, 
  updateEscola, 
  deleteEscola 
};
