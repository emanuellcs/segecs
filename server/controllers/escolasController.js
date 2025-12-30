const { query } = require('../config/db');

const getEscolas = async (req, res) => {
  try {
    const todas = await query(`
      SELECT e.*, c.cidade, c.uf 
      FROM cad_escolas e
      LEFT JOIN cad_cidades c ON e.id_cidade = c.id_cidade
      ORDER BY e.id_escola ASC
    `);
    res.json(todas.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erro ao buscar escolas" });
  }
};

const createEscola = async (req, res) => {
  try {
    const { nome_escola, inep, id_cidade, uf, endereco_escola, telefone, email, observacoes } = req.body;

    const nova = await query(
      `INSERT INTO cad_escolas (nome_escola, inep, id_cidade, uf, endereco_escola, telefone, email, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [nome_escola, inep, id_cidade, uf, endereco_escola, telefone, email, observacoes]
    );
    res.json(nova.rows[0]);
  } catch (err) {
    console.error('Erro ao criar escola:', err.message);
    
    // Tratamento de erros específicos
    if (err.message.includes('cad_escolas_inep_key')) {
      return res.status(400).json({ error: 'Já existe uma escola cadastrada com este código INEP.' });
    }
    
    if (err.message.includes('not-null')) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }
    
    res.status(500).json({ error: "Erro ao cadastrar escola" });
  }
};

const updateEscola = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_escola, inep, id_cidade, uf, endereco_escola, telefone, email, observacoes } = req.body;

    const updateOp = await query(
      `UPDATE cad_escolas
       SET nome_escola = $1, inep = $2, id_cidade = $3, uf = $4, endereco_escola = $5, 
           telefone = $6, email = $7, observacoes = $8, dt_atualizacao = CURRENT_TIMESTAMP
       WHERE id_escola = $9`,
      [nome_escola, inep, id_cidade, uf, endereco_escola, telefone, email, observacoes, id]
    );

    if (updateOp.rowCount === 0) {
      return res.status(404).json({ error: "Escola não encontrada" });
    }

    res.json({ message: "Escola atualizada com sucesso!" });
  } catch (err) {
    console.error('Erro ao atualizar escola:', err.message);
    
    // Tratamento de erros específicos
    if (err.message.includes('cad_escolas_inep_key')) {
      return res.status(400).json({ error: 'Já existe outra escola cadastrada com este código INEP.' });
    }
    
    res.status(500).json({ error: "Erro ao atualizar escola" });
  }
};

const deleteEscola = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteOp = await query("DELETE FROM cad_escolas WHERE id_escola = $1", [id]);
    
    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ error: "Escola não encontrada" });
    }
    
    res.json({ message: "Escola excluída com sucesso!" });
  } catch (err) {
    console.error('Erro ao deletar escola:', err.message);
    res.status(500).json({ error: "Erro ao deletar escola" });
  }
};

module.exports = { getEscolas, createEscola, updateEscola, deleteEscola };