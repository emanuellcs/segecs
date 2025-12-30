const { query } = require('../config/db');
const bcrypt = require('bcryptjs'); 

// 1. Listar Usuários
const getUsuarios = async (req, res) => {
  try {
    const sql = `
      SELECT u.id_usuario, u.nome_completo, u.email, n.nivel as nome_nivel 
      FROM sys_usuarios u
      LEFT JOIN sys_niveis_acesso n ON u.id_nivel = n.id_nivel
      ORDER BY u.nome_completo ASC
    `;
    const resultado = await query(sql);
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
};

// 2. Criar Usuário (CORRIGIDO: nome -> nome_completo)
const createUsuario = async (req, res) => {
  try {
    // AQUI ESTAVA O ERRO: O front manda nome_completo, não nome
    const { nome_completo, email, senha, id_nivel } = req.body; 

    // Validação básica
    if (!nome_completo || !email || !senha || !id_nivel) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(senha, salt);

    const sql = `
      INSERT INTO sys_usuarios (nome_completo, email, senha_hash, id_nivel, ativo)
      VALUES ($1, $2, $3, $4, true)
      RETURNING id_usuario, nome_completo, email
    `;
    
    // Passamos nome_completo aqui
    const novo = await query(sql, [nome_completo, email, hash, id_nivel]);
    res.json(novo.rows[0]);

  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ error: "Email já cadastrado." });
    }
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
};

// 3. Deletar Usuário
const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM sys_usuarios WHERE id_usuario = $1", [id]);
    res.json({ message: "Usuário removido" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar" });
  }
};

// 4. Buscar Usuário pelo ID (Para edição)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT id_usuario, nome_completo, email, id_nivel, ativo FROM sys_usuarios WHERE id_usuario = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
};

// 5. Atualizar Usuário
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nome_completo, email, senha, id_nivel, ativo } = req.body;

  try {
    if (senha && senha.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(senha, salt);
      
      await query(
        `UPDATE sys_usuarios 
         SET nome_completo=$1, email=$2, senha_hash=$3, id_nivel=$4, ativo=$5 
         WHERE id_usuario=$6`,
        [nome_completo, email, hash, id_nivel, ativo, id]
      );
    } else {
      await query(
        `UPDATE sys_usuarios 
         SET nome_completo=$1, email=$2, id_nivel=$3, ativo=$4 
         WHERE id_usuario=$5`,
        [nome_completo, email, id_nivel, ativo, id]
      );
    }

    res.json({ message: "Usuário atualizado com sucesso!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
};

module.exports = { getUsuarios, createUsuario, deleteUsuario, getUserById, updateUser };
