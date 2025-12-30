const express = require('express');
const router = express.Router();
const alunosController = require('../controllers/alunosController');

// Rota POST para criar aluno
router.post('/', alunosController.createAluno);
router.get('/', alunosController.getAlunos);
router.delete('/:id', alunosController.deleteAluno);
router.put('/:id', alunosController.updateAluno);

module.exports = router;
