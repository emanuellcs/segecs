const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../../shared/middleware/validate');
const {
  getCidades,
  createCidade,
  updateCidade,
  deleteCidade,
} = require('./cidades.controller');

// Validação de cidade
const cidadeValidationRules = [
  body('cidade').notEmpty().withMessage('Nome da cidade é obrigatório'),
  body('uf').isLength({ min: 2, max: 2 }).withMessage('UF inválida (deve ter 2 caracteres)'),
];

router.get('/', getCidades);
router.post('/', cidadeValidationRules, validate, createCidade);
router.put('/:id', cidadeValidationRules, validate, updateCidade);
router.delete('/:id', deleteCidade);

module.exports = router;
