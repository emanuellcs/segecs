const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../../shared/middleware/validate');
const responsaveisController = require('./responsaveis.controller');

// Validação de responsável
const responsavelValidationRules = [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('cpf').isLength({ min: 11, max: 14 }).withMessage('CPF inválido'),
];

router.get('/', responsaveisController.getResponsaveis);
router.post('/', responsavelValidationRules, validate, responsaveisController.createResponsavel);
router.put('/:id', responsavelValidationRules, validate, responsaveisController.updateResponsavel);
router.delete('/:id', responsaveisController.deleteResponsavel);

module.exports = router;
