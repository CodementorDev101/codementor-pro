// ✅ UPDATED FILE: User Routes
// Purpose: Define routes for user profile management and admin user management

const express = require('express');
const router = express.Router();
const {
  // Profile Management
  getProfile,
  updateProfile,
  changePassword,
  // Admin User Management
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
} = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// ========================================
// PROFILE MANAGEMENT ROUTES (All authenticated users)
// ========================================

// ✅ NEW: GET /api/users/profile - Get current user's profile
router.get('/profile', authenticate, getProfile);

// ✅ NEW: PUT /api/users/profile - Update current user's profile
router.put('/profile', authenticate, updateProfile);

// ✅ NEW: PUT /api/users/password - Change password
router.put('/password', authenticate, changePassword);

// ========================================
// ADMIN USER MANAGEMENT ROUTES
// ========================================

// GET /api/users - Get all users (Admin/Instructor only)
router.get('/', authenticate, authorize('instructor', 'admin'), getAllUsers);

// GET /api/users/:id - Get user by ID with statistics (Admin/Instructor only)
router.get('/:id', authenticate, authorize('instructor', 'admin'), getUserById);

// PUT /api/users/:id/role - Update user role (Admin only)
router.put('/:id/role', authenticate, authorize('admin'), updateUserRole);

// DELETE /api/users/:id - Delete user (Admin only)
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

module.exports = router;