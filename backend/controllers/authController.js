const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User } = require('../models');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../emailService');

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
      institution: assignedRole === 'instructor' ? institution : null,
      department: assignedRole === 'instructor' ? department : null,
      position: assignedRole === 'instructor' ? position : null,
      employee_id: assignedRole === 'instructor' ? employee_id : null,
      reason: assignedRole === 'instructor' ? reason : null,
      valid_id_image: assignedRole === 'instructor' ? valid_id_image : null
    });

    // Send welcome email (non-blocking)
    try {
      await sendWelcomeEmail(user.email, user.first_name);
    } catch (emailErr) {
      console.error('Welcome email failed (non-critical):', emailErr.message);
    }

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

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

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

    const isPasswordValid = await bcrypt.compare(password, user.password);

    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.role === 'instructor' && user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your instructor account is pending admin approval. Please wait.'
      });
    }

    if (user.role === 'instructor' && user.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your instructor account has been rejected. Please register again with updated credentials or contact admin2@gmail.com for assistance.'
      });
    }

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

/**
 * Forgot password - generate token and send email
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address.'
      });
    }

    const user = await User.findOne({ where: { email } });

    // Always return success even if email not found (security best practice)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If that email exists in our system, a reset link has been sent.'
      });
    }

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to DB
    await user.update({
      reset_token: resetToken,
      reset_token_expires: resetTokenExpires
    });

    // Send reset email
    await sendPasswordResetEmail(user.email, user.first_name, resetToken);

    res.status(200).json({
      success: true,
      message: 'If that email exists in our system, a reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request.',
      error: error.message
    });
  }
};

/**
 * Reset password - verify token and update password
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.'
      });
    }

    const user = await User.findOne({ where: { reset_token: token } });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link.'
      });
    }

    // Check if token is expired
    if (new Date() > new Date(user.reset_token_expires)) {
      return res.status(400).json({
        success: false,
        message: 'Reset link has expired. Please request a new one.'
      });
    }

    // Update password and clear token
    await user.update({
      password: newPassword,
      reset_token: null,
      reset_token_expires: null
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password.',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword
};