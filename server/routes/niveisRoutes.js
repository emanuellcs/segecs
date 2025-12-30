const express = require('express');
const router = express.Router();
const niveisController = require('../controllers/niveisController');

const { getNiveis, createNivel, deleteNivel, updateNivel } = require('../controllers/niveisController');

router.get('/', niveisController.getNiveis);
router.get('/:id', niveisController.getNivelById);
router.post('/', niveisController.createNivel);
router.delete('/:id', niveisController.deleteNivel);
router.put('/:id', updateNivel);

module.exports = router;
