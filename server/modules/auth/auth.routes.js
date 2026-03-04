const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../../shared/middleware/validate');
const authController = require('./auth.controller');

// Validação de login
const loginValidationRules = [
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').notEmpty().withMessage('Senha é obrigatória'),
];

// Define a rota de login
router.post('/login', loginValidationRules, validate, authController.login);

module.exports = router;
