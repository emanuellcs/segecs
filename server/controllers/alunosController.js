const { query } = require('../config/db');

/**
 * Listar todos os alunos com nome do curso
 */
const getAlunos = async (req, res, next) => {
  try {
    const sql = `
      SELECT a.*, c.nome_curso 
      FROM cad_alunos a 
      LEFT JOIN cad_cursos c ON a.id_curso = c.id_curso 
      ORDER BY a.nome ASC
    `;
    const todos = await query(sql);
    res.json(todos.rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Buscar aluno por ID
 */
const getAlunoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM cad_alunos WHERE id_aluno = $1', [id]);

    if (result.rows.length === 0) {
      const error = new Error('Aluno não encontrado');
      error.statusCode = 404;
      throw error;
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Criar novo aluno
 */
const createAluno = async (req, res, next) => {
  try {
    const {
      matricula,
      nome,
      rg,
      cpf,
      nasc,
      telefone,
      email,
      id_cidade,
      bairro,
      zona,
      id_curso,
      turma,
      observacoes,
      inform_egressa,
      facebook,
      linkedin,
      github,
    } = req.body;

    // Validação básica de campos obrigatórios
    if (!matricula || !nome || !cpf || !nasc || !id_curso) {
      const error = new Error(
        'Campos obrigatórios: matrícula, nome, cpf, data de nascimento e curso.'
      );
      error.statusCode = 400;
      throw error;
    }

    const sql = `
      INSERT INTO cad_alunos (
        matricula, nome, rg, cpf, nasc, telefone, email, 
        id_cidade, bairro, zona, id_curso, turma, 
        observacoes, inform_egressa, facebook, linkedin, github
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
      RETURNING *
    `;

    const result = await query(sql, [
      matricula,
      nome,
      rg,
      cpf,
      nasc,
      telefone,
      email,
      id_cidade || null,
      bairro,
      zona,
      id_curso,
      turma,
      observacoes,
      inform_egressa,
      facebook,
      linkedin,
      github,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Atualizar aluno
 */
const updateAluno = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      matricula,
      nome,
      rg,
      cpf,
      nasc,
      telefone,
      email,
      id_cidade,
      bairro,
      zona,
      id_curso,
      turma,
      observacoes,
      inform_egressa,
      facebook,
      linkedin,
      github,
    } = req.body;

    const sql = `
      UPDATE cad_alunos 
      SET matricula = $1, nome = $2, rg = $3, cpf = $4, nasc = $5, 
          telefone = $6, email = $7, id_cidade = $8, bairro = $9, zona = $10, 
          id_curso = $11, turma = $12, observacoes = $13, inform_egressa = $14, 
          facebook = $15, linkedin = $16, github = $17, dt_atualizacao = CURRENT_TIMESTAMP
      WHERE id_aluno = $18
      RETURNING *
    `;

    const result = await query(sql, [
      matricula,
      nome,
      rg,
      cpf,
      nasc,
      telefone,
      email,
      id_cidade || null,
      bairro,
      zona,
      id_curso,
      turma,
      observacoes,
      inform_egressa,
      facebook,
      linkedin,
      github,
      id,
    ]);

    if (result.rowCount === 0) {
      const error = new Error('Aluno não encontrado');
      error.statusCode = 404;
      throw error;
    }

    res.json({ message: 'Aluno atualizado com sucesso!', aluno: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Remover aluno
 */
const deleteAluno = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM cad_alunos WHERE id_aluno = $1', [id]);

    if (result.rowCount === 0) {
      const error = new Error('Aluno não encontrado');
      error.statusCode = 404;
      throw error;
    }

    res.json({ message: 'Aluno excluído com sucesso!' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAlunos,
  getAlunoById,
  createAluno,
  updateAluno,
  deleteAluno,
};
