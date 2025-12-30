const { query } = require('../config/db');

const getResponsaveis = async (req, res) => {
  try {
    const todos = await query(`
      SELECT r.*, c.cidade, c.uf 
      FROM cad_responsaveis r
      LEFT JOIN cad_cidades c ON r.id_cidade = c.id_cidade
      ORDER BY r.id_responsavel ASC
    `);
    res.json(todos.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erro ao buscar responsáveis" });
  }
};

const createResponsavel = async (req, res) => {
  try {
    const { nome, rg, cpf, telefone, id_cidade, bairro, observacoes } = req.body;

    const novo = await query(
      `INSERT INTO cad_responsaveis (nome, rg, cpf, telefone, id_cidade, bairro, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nome, rg, cpf, telefone, id_cidade, bairro, observacoes]
    );
    res.json(novo.rows[0]);
  } catch (err) {
    console.error('Erro ao criar responsável:', err.message);
    
    // Tratamento de erros específicos
    if (err.message.includes('cad_responsaveis_cpf_key')) {
      return res.status(400).json({ error: 'Já existe um responsável cadastrado com este CPF.' });
    }
    
    if (err.message.includes('not-null')) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }
    
    res.status(500).json({ error: "Erro ao cadastrar responsável" });
  }
};

const updateResponsavel = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, rg, cpf, telefone, id_cidade, bairro, observacoes } = req.body;

    const updateOp = await query(
      `UPDATE cad_responsaveis
       SET nome = $1, rg = $2, cpf = $3, telefone = $4, id_cidade = $5, 
           bairro = $6, observacoes = $7, dt_atualizacao = CURRENT_TIMESTAMP
       WHERE id_responsavel = $8`,
      [nome, rg, cpf, telefone, id_cidade, bairro, observacoes, id]
    );

    if (updateOp.rowCount === 0) {
      return res.status(404).json({ error: "Responsável não encontrado" });
    }

    res.json({ message: "Responsável atualizado com sucesso!" });
  } catch (err) {
    console.error('Erro ao atualizar responsável:', err.message);
    
    // Tratamento de erros específicos
    if (err.message.includes('cad_responsaveis_cpf_key')) {
      return res.status(400).json({ error: 'Já existe outro responsável cadastrado com este CPF.' });
    }
    
    res.status(500).json({ error: "Erro ao atualizar responsável" });
  }
};

const deleteResponsavel = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteOp = await query("DELETE FROM cad_responsaveis WHERE id_responsavel = $1", [id]);
    
    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ error: "Responsável não encontrado" });
    }
    
    res.json({ message: "Responsável excluído com sucesso!" });
  } catch (err) {
    console.error('Erro ao deletar responsável:', err.message);
    res.status(500).json({ error: "Erro ao deletar responsável" });
  }
};

module.exports = { getResponsaveis, createResponsavel, updateResponsavel, deleteResponsavel };