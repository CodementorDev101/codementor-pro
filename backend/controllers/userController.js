// ✅ UPDATED FILE: User Controller
// Purpose: Handle user operations (profile management + admin user management)

const bcrypt = require('bcrypt');
const { User, Submission, Exercise } = require('../models');
const { Op } = require('sequelize');

// ========================================
// PROFILE MANAGEMENT (All Users)
// ========================================

// ✅ NEW: Get current user profile
const getProfile = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'created_at']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile.',
      error: error.message
    });
  }
};

// ✅ NEW: Update user profile (name, email)
const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;

    // Validation
    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required.'
      });
    }

    // Check if email is already taken by another user
    if (email !== req.user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another account.'
        });
      }
    }

    // Update user
    const user = await User.findByPk(req.user.id);
    await user.update({
      first_name,
      last_name,
      email
    });

    // Return updated user (without password)
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'created_at']
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
      error: error.message
    });
  }
};

// ✅ FIXED: Change password - let model hook handle hashing
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    // Validation
    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'All password fields are required.'
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match.'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    // Get user with password field
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: { include: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    console.log('User found:', user.email);

    // Verify current password
    const isValidPassword = await bcrypt.compare(current_password, user.password);
    
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    // ✅ FIX: Pass raw password, let the beforeUpdate hook handle hashing
    user.password = new_password;
    await user.save();
    
    console.log('Password updated for:', user.email);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password.',
      error: error.message
    });
  }
};

// ========================================
// ADMIN USER MANAGEMENT
// ========================================

/**
 * Get all users (Admin/Instructor only)
 */
const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;

    const whereClause = {};
    
    if (role) {
      whereClause.role = role;
    }

    if (search) {
      whereClause[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: { users }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users.',
      error: error.message
    });
  }
};

/**
 * Get user by ID with statistics
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Get user statistics
    const totalSubmissions = await Submission.count({
      where: { user_id: id }
    });

    const acceptedSubmissions = await Submission.count({
      where: { 
        user_id: id,
        status: 'accepted'
      }
    });

    const averageScore = await Submission.findOne({
      where: { user_id: id },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('score')), 'avgScore']
      ],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        user,
        statistics: {
          total_submissions: totalSubmissions,
          accepted_submissions: acceptedSubmissions,
          average_score: averageScore?.avgScore ? parseFloat(averageScore.avgScore).toFixed(2) : '0.00'
        }
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user.',
      error: error.message
    });
  }
};

/**
 * Update user role (Admin only)
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be student, instructor, or admin.'
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    await user.update({ role });

    res.status(200).json({
      success: true,
      message: 'User role updated successfully.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role.',
      error: error.message
    });
  }
};

/**
 * Delete user (Admin only)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.'
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user.',
      error: error.message
    });
  }
};

// ✅ UPDATED: Export all functions including new profile management functions
module.exports = {
  // Profile Management
  getProfile,
  updateProfile,
  changePassword,
  // Admin User Management
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
};