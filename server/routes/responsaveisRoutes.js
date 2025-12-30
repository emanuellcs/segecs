const express = require('express');
const router = express.Router();
const responsaveisController = require('../controllers/responsaveisController');

router.post('/', responsaveisController.createResponsavel);
router.get('/', responsaveisController.getResponsaveis);
router.delete('/:id', responsaveisController.deleteResponsavel);
router.put('/:id', responsaveisController.updateResponsavel);

module.exports = router;
