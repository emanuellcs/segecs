const { query } = require('../config/db');

// Listar todos os Níveis
const getNiveis = async (req, res) => {
  try {
    const result = await query('SELECT * FROM sys_niveis_acesso ORDER BY id_nivel ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar níveis" });
  }
};

// Buscar um único Nível por ID (ESSENCIAL PARA A EDIÇÃO)
const getNivelById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM sys_niveis_acesso WHERE id_nivel = $1', [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Retorna o objeto direto: { id_nivel, nivel, descricao }
    } else {
      res.status(404).json({ error: "Nível não encontrado" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar detalhes do nível" });
  }
};

// Criar Nível
const createNivel = async (req, res) => {
  const { nivel, descricao } = req.body;
  try {
    const sql = 'INSERT INTO sys_niveis_acesso (nivel, descricao) VALUES ($1, $2) RETURNING *';
    const result = await query(sql, [nivel, descricao]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ error: "Este nível já existe." });
    }
    res.status(500).json({ error: "Erro ao criar nível" });
  }
};

// Atualizar Nível
const updateNivel = async (req, res) => {
  const { id } = req.params;
  const { nivel, descricao } = req.body;
  
  try {
    const sql = `
        UPDATE sys_niveis_acesso 
        SET nivel = $1, descricao = $2, dt_atualizacao = CURRENT_TIMESTAMP 
        WHERE id_nivel = $3
    `;
    await query(sql, [nivel, descricao, id]);
    res.json({ message: "Nível atualizado com sucesso" });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ error: "Já existe outro nível com este nome." });
    }
    res.status(500).json({ error: "Erro ao atualizar nível" });
  }
};

// Deletar Nível
const deleteNivel = async (req, res) => {
  const { id } = req.params;
  try {
    const checkUsers = await query('SELECT count(*) FROM sys_usuarios WHERE id_nivel = $1', [id]);
    if (parseInt(checkUsers.rows[0].count) > 0) {
      return res.status(400).json({ error: "Proibido excluir: Existem usuários vinculados a este nível." });
    }

    await query('DELETE FROM sys_niveis_acesso WHERE id_nivel = $1', [id]);
    res.json({ message: "Nível removido" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar nível" });
  }
};

// Exporte todas as funções, incluindo a nova getNivelById
module.exports = { getNiveis, getNivelById, createNivel, updateNivel, deleteNivel };