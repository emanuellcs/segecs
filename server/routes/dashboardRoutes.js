const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

router.get('/stats', async (req, res) => {
  try {
    // CORREÇÃO FEITA: Agora buscando da tabela 'cad_alunos'
    const alunos = await query('SELECT COUNT(*) FROM cad_alunos');
    
    // As outras tabelas continuam iguais
    const niveis = await query('SELECT COUNT(*) FROM sys_niveis_acesso');
    const usuarios = await query('SELECT COUNT(*) FROM sys_usuarios');

    // Converte os resultados para números inteiros e envia
    res.json({
      totalAlunos: parseInt(alunos.rows[0].count),
      totalNiveis: parseInt(niveis.rows[0].count),
      totalUsuarios: parseInt(usuarios.rows[0].count)
    });
  } catch (err) {
    console.error("Erro no Dashboard:", err.message);
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

module.exports = router;
