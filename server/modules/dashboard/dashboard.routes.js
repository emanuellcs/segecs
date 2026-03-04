const express = require('express');
const router = express.Router();
const { query } = require('../../shared/config/db');

router.get('/stats', async (req, res, next) => {
  try {
    const alunos = await query('SELECT COUNT(*) FROM cad_alunos');
    const niveis = await query('SELECT COUNT(*) FROM sys_niveis_acesso');
    const usuarios = await query('SELECT COUNT(*) FROM sys_usuarios');

    res.json({
      totalAlunos: parseInt(alunos.rows[0].count),
      totalNiveis: parseInt(niveis.rows[0].count),
      totalUsuarios: parseInt(usuarios.rows[0].count),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
