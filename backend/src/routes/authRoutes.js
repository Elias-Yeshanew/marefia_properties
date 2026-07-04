const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Only need authMiddleware for getMe

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected route (requires authentication)
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;