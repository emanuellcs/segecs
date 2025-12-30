const express = require('express');
const router = express.Router();
const { getCidades, createCidade, updateCidade, deleteCidade } = require('../controllers/cidadesController');

router.get('/', getCidades);
router.post('/', createCidade);
router.put('/:id', updateCidade);
router.delete('/:id', deleteCidade);

module.exports = router;
