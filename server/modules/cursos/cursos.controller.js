const { query } = require('../../shared/config/db');

/**
 * Listar todos os cursos
 */
const getCursos = async (req, res, next) => {
  try {
    const todos = await query('SELECT * FROM cad_cursos ORDER BY id_curso ASC');
    res.json(todos.rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Criar novo curso
 */
const createCurso = async (req, res, next) => {
  try {
    const { nome_curso, eixo_curso, observacoes } = req.body;

    const sql = `
      INSERT INTO cad_cursos (nome_curso, eixo_curso, observacoes)
      VALUES ($1, $2, $3) RETURNING *
    `;

    const result = await query(sql, [nome_curso, eixo_curso, observacoes]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Atualizar curso
 */
const updateCurso = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome_curso, eixo_curso, observacoes } = req.body;

    const sql = `
      UPDATE cad_cursos
      SET nome_curso = $1, eixo_curso = $2, observacoes = $3, dt_atualizacao = CURRENT_TIMESTAMP
      WHERE id_curso = $4
      RETURNING *
    `;

    const result = await query(sql, [nome_curso, eixo_curso, observacoes, id]);

    if (result.rowCount === 0) {
      const error = new Error('Curso não encontrado');
      error.statusCode = 404;
      throw error;
    }

    res.json({ message: 'Curso atualizado com sucesso!', curso: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Remover curso
 */
const deleteCurso = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM cad_cursos WHERE id_curso = $1', [id]);

    if (result.rowCount === 0) {
      const error = new Error('Curso não encontrado');
      error.statusCode = 404;
      throw error;
    }

    res.json({ message: 'Curso excluído com sucesso!' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCursos,
  createCurso,
  deleteCurso,
  updateCurso,
};
