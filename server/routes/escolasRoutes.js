const express = require('express');
const router = express.Router();
const escolasController = require('../controllers/escolasController');

router.post('/', escolasController.createEscola);
router.get('/', escolasController.getEscolas);
router.delete('/:id', escolasController.deleteEscola);
router.put('/:id', escolasController.updateEscola);

module.exports = router;