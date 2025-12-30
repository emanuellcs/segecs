const { query } = require('../config/db');

// Listar Cidades
const getCidades = async (req, res) => {
  try {
    const result = await query('SELECT * FROM cad_cidades ORDER BY cidade ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar cidades" });
  }
};

// Criar Cidade
const createCidade = async (req, res) => {
  const { cidade, uf, observacoes } = req.body;
  try {
    // Não passamos as datas, o banco define o DEFAULT
    const sql = 'INSERT INTO cad_cidades (cidade, uf, observacoes) VALUES ($1, $2, $3) RETURNING *';
    const result = await query(sql, [cidade, uf, observacoes]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao cadastrar cidade" });
  }
};

// Atualizar Cidade (A Lógica das Datas está aqui)
const updateCidade = async (req, res) => {
  const { id } = req.params;
  const { cidade, uf, observacoes } = req.body;
  
  try {
    // AQUI: Forçamos a atualização da data de modificação
    const sql = `
        UPDATE cad_cidades 
        SET cidade = $1, uf = $2, observacoes = $3, dt_atualizacao = CURRENT_TIMESTAMP 
        WHERE id_cidade = $4
    `;
    await query(sql, [cidade, uf, observacoes, id]);
    res.json({ message: "Cidade atualizada com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar cidade" });
  }
};

// Deletar Cidade
const deleteCidade = async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM cad_cidades WHERE id_cidade = $1', [id]);
    res.json({ message: "Cidade removida" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar cidade" });
  }
};

module.exports = { getCidades, createCidade, updateCidade, deleteCidade };
