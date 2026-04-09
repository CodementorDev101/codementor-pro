const { User, Exercise, Submission } = require('../models');
const bcrypt = require('bcrypt');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query;

    // Build where clause
    const where = {};

    // Add search filter (first_name, last_name, or email)
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Add role filter
    if (role && role !== 'all') {
      where.role = role;
    }

    const users = await User.findAll({
      where,
      attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'status', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    // Transform data to include full name
    const usersWithName = users.map(user => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.created_at
    }));

    res.json({
      success: true,
      data: usersWithName
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password, status } = req.body;

    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from demoting themselves
    if (user.id === req.user.id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own admin role'
      });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Update name (split into first_name and last_name if provided)
    if (name) {
      const nameParts = name.trim().split(' ');
      user.first_name = nameParts[0];
      user.last_name = nameParts.slice(1).join(' ') || nameParts[0];
    }

    user.email = email || user.email;
    user.role = role || user.role;

    // ✅ NEW: Update status if provided (for approve/reject)
    if (status) {
      user.status = status;
    }

    // Update password if provided
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Get related data counts for information
    const exerciseCount = await Exercise.count({ where: { created_by: id } });
    const submissionCount = await Submission.count({ where: { user_id: id } });

    // Delete user (this will cascade delete related submissions)
    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deletedUser: {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: user.role
        },
        relatedData: {
          exercises: exerciseCount,
          submissions: submissionCount
        }
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};