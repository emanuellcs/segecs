const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../../shared/middleware/validate');
const escolasController = require('./escolas.controller');

// Validação de escola
const escolaValidationRules = [
  body('nome_escola').notEmpty().withMessage('Nome da escola é obrigatório'),
  body('inep').notEmpty().withMessage('INEP é obrigatório'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email inválido'),
];

router.get('/', escolasController.getEscolas);
router.post('/', escolaValidationRules, validate, escolasController.createEscola);
router.put('/:id', escolaValidationRules, validate, escolasController.updateEscola);
router.delete('/:id', escolasController.deleteEscola);

module.exports = router;
