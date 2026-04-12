const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const {
      email, password, first_name, last_name, role,
      institution, department, position, employee_id, reason, valid_id_image
    } = req.body;

    // Validate basic fields
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.'
      });
    }

    // Validate instructor-specific fields
    const assignedRole = role || 'student';
    if (assignedRole === 'instructor') {
      if (!institution || !department || !position || !employee_id || !reason) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required instructor credentials.'
        });
      }
      if (!valid_id_image) {
        return res.status(400).json({
          success: false,
          message: 'Please upload a valid ID image.'
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    // Instructors need admin approval, everyone else is auto-approved
    const assignedStatus = assignedRole === 'instructor' ? 'pending' : 'approved';

    // Create user
    const user = await User.create({
      email,
      password,
      first_name,
      last_name,
      role: assignedRole,
      status: assignedStatus,
      // Instructor credential fields (null for students)
      institution: assignedRole === 'instructor' ? institution : null,
      department: assignedRole === 'instructor' ? department : null,
      position: assignedRole === 'instructor' ? position : null,
      employee_id: assignedRole === 'instructor' ? employee_id : null,
      reason: assignedRole === 'instructor' ? reason : null,
      valid_id_image: assignedRole === 'instructor' ? valid_id_image : null
    });

    // If instructor, don't give token yet — they need approval first
    if (assignedRole === 'instructor') {
      return res.status(201).json({
        success: true,
        message: 'Registration submitted! Please wait for admin approval before logging in.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            status: user.status
          }
        }
      });
    }

    // Generate JWT token for students and admins
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          status: user.status
        },
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed.',
      error: error.message
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    // Explicitly include password and status fields
    const user = await User.findOne({
      where: { email },
      attributes: { include: ['password', 'status'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    console.log('Login attempt for:', user.email);

    // Use bcrypt.compare directly
    const isPasswordValid = await bcrypt.compare(password, user.password);

    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Block pending instructors
    if (user.role === 'instructor' && user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your instructor account is pending admin approval. Please wait.'
      });
    }

    // Block rejected instructors
    if (user.role === 'instructor' && user.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your instructor account has been rejected. Please contact the administrator.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          status: user.status
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed.',
      error: error.message
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          role: req.user.role,
          created_at: req.user.created_at
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile.',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile
};