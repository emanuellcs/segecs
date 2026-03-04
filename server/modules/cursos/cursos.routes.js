const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../../shared/middleware/validate');
const cursosController = require('./cursos.controller');

// Validação de curso
const cursoValidationRules = [
  body('nome_curso').notEmpty().withMessage('Nome do curso é obrigatório'),
  body('eixo_curso').notEmpty().withMessage('Eixo do curso é obrigatório'),
];

router.get('/', cursosController.getCursos);
router.post('/', cursoValidationRules, validate, cursosController.createCurso);
router.put('/:id', cursoValidationRules, validate, cursosController.updateCurso);
router.delete('/:id', cursosController.deleteCurso);

module.exports = router;
