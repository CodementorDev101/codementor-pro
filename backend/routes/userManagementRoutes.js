const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');
const userManagementController = require('../controllers/userManagementController');

// Get all users (with optional filters)
router.get('/', authenticate, authorizeAdmin, userManagementController.getAllUsers);

// Update user by ID
router.put('/:id', authenticate, authorizeAdmin, userManagementController.updateUser);

// Delete user by ID
router.delete('/:id', authenticate, authorizeAdmin, userManagementController.deleteUser);

module.exports = router;