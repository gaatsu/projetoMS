const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const AuthMiddleware = require('../../infrastructure/middlewares/auth.middleware');

// Rotas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/recovery/request', authController.requestPasswordRecovery);
router.post('/recovery/reset', authController.resetPassword);

// Rotas protegidas
router.post('/logout', AuthMiddleware.authenticate, authController.logout);

module.exports = router; 