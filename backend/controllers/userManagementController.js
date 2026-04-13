const { User, Exercise, Submission } = require('../models');
const bcrypt = require('bcrypt');
const { sendApprovalEmail } = require('../emailService');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query;

    const where = {};

    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    if (role && role !== 'all') {
      where.role = role;
    }

    const users = await User.findAll({
      where,
      attributes: [
        'id', 'first_name', 'last_name', 'email', 'role', 'status', 'created_at',
        'institution', 'department', 'position', 'employee_id', 'reason', 'valid_id_image'
      ],
      order: [['created_at', 'DESC']]
    });

    const usersWithName = users.map(user => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.created_at,
      institution: user.institution,
      department: user.department,
      position: user.position,
      employee_id: user.employee_id,
      reason: user.reason,
      valid_id_image: user.valid_id_image
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

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.id === req.user.id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own admin role'
      });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Check if instructor is being approved (was pending, now approved)
    const isBeingApproved = user.role === 'instructor'
      && user.status === 'pending'
      && status === 'approved';

    if (name) {
      const nameParts = name.trim().split(' ');
      user.first_name = nameParts[0];
      user.last_name = nameParts.slice(1).join(' ') || nameParts[0];
    }

    user.email = email || user.email;
    user.role = role || user.role;

    if (status) {
      user.status = status;
    }

    if (password && password.trim() !== '') {
      user.password = password;
    }
    await user.save();

    // Send approval email after saving (non-blocking)
    if (isBeingApproved) {
      try {
        await sendApprovalEmail(user.email, user.first_name);
      } catch (emailErr) {
        console.error('Approval email failed (non-critical):', emailErr.message);
      }
    }

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

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const exerciseCount = await Exercise.count({ where: { created_by: id } });
    const submissionCount = await Submission.count({ where: { user_id: id } });

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