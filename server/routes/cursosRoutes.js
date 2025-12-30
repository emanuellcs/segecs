const express = require('express');
const router = express.Router();
const cursosController = require('../controllers/cursosController');

router.post('/', cursosController.createCurso);
router.get('/', cursosController.getCursos);
router.delete('/:id', cursosController.deleteCurso);
router.put('/:id', cursosController.updateCurso);

module.exports = router;