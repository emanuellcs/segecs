const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../../shared/middleware/validate');
const alunosController = require('./alunos.controller');

// Regras de validação para Alunos
const alunoValidationRules = [
  body('matricula').notEmpty().withMessage('Matrícula é obrigatória'),
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('cpf').isLength({ min: 11, max: 14 }).withMessage('CPF inválido'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email inválido'),
  body('nasc').notEmpty().withMessage('Data de nascimento é obrigatória'),
  body('id_curso').notEmpty().withMessage('Curso é obrigatório'),
];

// Rotas de Alunos
router.get('/', alunosController.getAlunos);
router.get('/:id', alunosController.getAlunoById);
router.post('/', alunoValidationRules, validate, alunosController.createAluno);
router.put('/:id', alunoValidationRules, validate, alunosController.updateAluno);
router.delete('/:id', alunosController.deleteAluno);

module.exports = router;
