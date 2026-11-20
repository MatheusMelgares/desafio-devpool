const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Mapeia os métodos HTTP (GET, POST, PUT, DELETE) para suas funções no Controller
router.get('/', userController.index);
router.get('/:id', userController.show);
router.post('/', userController.store);
router.put('/:id', userController.update);
router.delete('/:id', userController.destroy);

// Exporta as rotas para serem usadas pelo server.js
module.exports = router;