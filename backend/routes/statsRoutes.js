const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/statsController');
const { authenticate } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/stats
 * @desc    Get statistics based on user role
 * @access  Private (All authenticated users)
 * @returns Role-specific statistics for dashboard widgets
 */
router.get('/', authenticate, getStats);

module.exports = router;