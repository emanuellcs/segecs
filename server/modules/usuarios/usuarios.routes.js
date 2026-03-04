const express = require('express');
const router = express.Router();
const usuariosController = require('./usuarios.controller');
const { body } = require('express-validator');
const validate = require('../../shared/middleware/validate');
const { authorizeLevels } = require('../../shared/middleware/authMiddleware');

// Validações para Criar/Atualizar Usuário
const usuarioValidation = [
  body('nome_completo').notEmpty().withMessage('Nome completo é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('id_nivel').isInt().withMessage('Nível de acesso inválido'),
  validate,
];

const senhaValidation = [
  body('senha').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),
  validate,
];

// Apenas Administradores (Nível 1) podem gerenciar usuários
router.get('/', authorizeLevels([1]), usuariosController.getUsuarios);
router.get('/:id', authorizeLevels([1]), usuariosController.getUserById);
router.post(
  '/',
  authorizeLevels([1]),
  usuarioValidation,
  senhaValidation,
  usuariosController.createUsuario
);
router.put('/:id', authorizeLevels([1]), usuarioValidation, usuariosController.updateUser);
router.delete('/:id', authorizeLevels([1]), usuariosController.deleteUsuario);

module.exports = router;
