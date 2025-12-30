const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { getUsuarios, createUsuario, deleteUsuario, getUserById, updateUser } = require('../controllers/usuariosController');


router.get('/', usuariosController.getUsuarios);
router.post('/', usuariosController.createUsuario);
router.delete('/:id', usuariosController.deleteUsuario);
router.get('/:id', getUserById);  // Pega dados para editar
router.put('/:id', updateUser);   // Salva a edição

module.exports = router;
