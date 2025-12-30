const { query } = require('../config/db');

// Listar
const getAlunos = async (req, res) => {
  try {
    const todos = await query(`
      SELECT a.*, c.nome_curso 
      FROM cad_alunos a 
      LEFT JOIN cad_cursos c ON a.id_curso = c.id_curso 
      ORDER BY a.id_aluno ASC
    `);
    res.json(todos.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erro ao buscar alunos" });
  }
};

// Criar
const createAluno = async (req, res) => {
  try {
    const { 
      matricula, nome, rg, cpf, nasc, telefone, email, 
      id_cidade, bairro, zona, id_curso, turma, 
      observacoes, inform_egressa, facebook, linkedin, github 
    } = req.body;
    
    const novo = await query(
      `INSERT INTO cad_alunos (
        matricula, nome, rg, cpf, nasc, telefone, email, 
        id_cidade, bairro, zona, id_curso, turma, 
        observacoes, inform_egressa, facebook, linkedin, github
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
      RETURNING *`,
      [
        matricula, nome, rg, cpf, nasc, telefone, email, 
        id_cidade || 1, bairro, zona, id_curso, turma, 
        observacoes, inform_egressa, facebook, linkedin, github
      ]
    );
    
    res.json(novo.rows[0]);
  } catch (err) {
    console.error('Erro ao criar aluno:', err.message);
    
    // Tratamento de erros específicos
    if (err.message.includes('cad_alunos_cpf_key')) {
      return res.status(400).json({ error: 'Já existe um aluno cadastrado com este CPF.' });
    }
    
    if (err.message.includes('cad_alunos_matricula_key')) {
      return res.status(400).json({ error: 'Já existe um aluno cadastrado com esta matrícula.' });
    }
    
    if (err.message.includes('not-null')) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }
    
    res.status(500).json({ error: "Erro ao cadastrar aluno" });
  }
};

// Atualizar
const updateAluno = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      matricula, nome, rg, cpf, nasc, telefone, email, 
      id_cidade, bairro, zona, id_curso, turma, 
      observacoes, inform_egressa, facebook, linkedin, github 
    } = req.body;

    const updateOp = await query(
      `UPDATE cad_alunos 
       SET matricula = $1, nome = $2, rg = $3, cpf = $4, nasc = $5, 
           telefone = $6, email = $7, id_cidade = $8, bairro = $9, zona = $10, 
           id_curso = $11, turma = $12, observacoes = $13, inform_egressa = $14, 
           facebook = $15, linkedin = $16, github = $17, dt_atualizacao = CURRENT_TIMESTAMP
       WHERE id_aluno = $18`,
      [
        matricula, nome, rg, cpf, nasc, telefone, email, 
        id_cidade || 1, bairro, zona, id_curso, turma, 
        observacoes, inform_egressa, facebook, linkedin, github, id
      ]
    );

    if (updateOp.rowCount === 0) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    res.json({ message: "Aluno atualizado com sucesso!" });
  } catch (err) {
    console.error('Erro ao atualizar aluno:', err.message);
    
    // Tratamento de erros específicos
    if (err.message.includes('cad_alunos_cpf_key')) {
      return res.status(400).json({ error: 'Já existe outro aluno cadastrado com este CPF.' });
    }
    
    if (err.message.includes('cad_alunos_matricula_key')) {
      return res.status(400).json({ error: 'Já existe outro aluno cadastrado com esta matrícula.' });
    }
    
    res.status(500).json({ error: "Erro ao atualizar aluno" });
  }
};

// Deletar
const deleteAluno = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteOp = await query("DELETE FROM cad_alunos WHERE id_aluno = $1", [id]);
    
    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }
    
    res.json({ message: "Aluno excluído com sucesso!" });
  } catch (err) {
    console.error('Erro ao deletar aluno:', err.message);
    res.status(500).json({ error: "Erro ao deletar aluno" });
  }
};

module.exports = { getAlunos, createAluno, updateAluno, deleteAluno };