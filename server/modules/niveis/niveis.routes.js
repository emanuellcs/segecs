const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../../shared/middleware/validate');
const niveisController = require('./niveis.controller');

// Validação de nível
const nivelValidationRules = [body('nivel').notEmpty().withMessage('Nome do nível é obrigatório')];

router.get('/', niveisController.getNiveis);
router.get('/:id', niveisController.getNivelById);
router.post('/', nivelValidationRules, validate, niveisController.createNivel);
router.put('/:id', nivelValidationRules, validate, niveisController.updateNivel);
router.delete('/:id', niveisController.deleteNivel);

module.exports = router;
