const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');
const analyticsController = require('../controllers/analyticsController');

// Get overall platform statistics
router.get('/overall-stats', authenticate, authorizeAdmin, analyticsController.getOverallStats);

// Get exercise completion rates
router.get('/exercise-completion-rates', authenticate, authorizeAdmin, analyticsController.getExerciseCompletionRates);

// Get most difficult exercises
router.get('/most-difficult-exercises', authenticate, authorizeAdmin, analyticsController.getMostDifficultExercises);

// Get most popular exercises
router.get('/most-popular-exercises', authenticate, authorizeAdmin, analyticsController.getMostPopularExercises);

// Get student performance overview
router.get('/student-performance', authenticate, authorizeAdmin, analyticsController.getStudentPerformance);

// Get submissions trend over time
router.get('/submissions-trend', authenticate, authorizeAdmin, analyticsController.getSubmissionsTrend);

// Get language distribution
router.get('/language-distribution', authenticate, authorizeAdmin, analyticsController.getLanguageDistribution);

// Get difficulty distribution
router.get('/difficulty-distribution', authenticate, authorizeAdmin, analyticsController.getDifficultyDistribution);

// Public stats — no auth required (for landing page)
router.get('/public-stats', analyticsController.getPublicStats);

module.exports = router;