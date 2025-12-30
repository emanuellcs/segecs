const { query } = require('../config/db');

const getCursos = async (req, res) => {
  try {
    const todos = await query("SELECT * FROM cad_cursos ORDER BY id_curso ASC");
    res.json(todos.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
};

const createCurso = async (req, res) => {
  try {
    const { nome_curso, eixo_curso, observacoes } = req.body;

    const novo = await query(
      `INSERT INTO cad_cursos (nome_curso, eixo_curso, observacoes)
       VALUES ($1, $2, $3) RETURNING *`,
      [nome_curso, eixo_curso, observacoes]
    );
    res.json(novo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao cadastrar curso");
  }
};

const deleteCurso = async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM cad_cursos WHERE id_curso = $1", [id]);
    res.json({ message: "Curso excluído!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro ao deletar curso");
  }
};

const updateCurso = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_curso, eixo_curso, observacoes } = req.body;

    const updateOp = await query(
      `UPDATE cad_cursos
       SET nome_curso = $1, eixo_curso = $2, observacoes = $3, dt_atualizacao = CURRENT_TIMESTAMP
       WHERE id_curso = $4`,
      [nome_curso, eixo_curso, observacoes, id]
    );

    if (updateOp.rowCount === 0) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    res.json({ message: "Curso atualizado com sucesso!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erro ao atualizar curso." });
  }
};

module.exports = { getCursos, createCurso, deleteCurso, updateCurso };