const express = require('express');
const router = express.Router();
const instructorAnalyticsController = require('../controllers/instructorAnalyticsController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeInstructor } = require('../middleware/authMiddleware');

// All routes require authentication and instructor role
router.use(authenticate);
router.use(authorizeInstructor);

// GET /api/instructor-analytics/stats - Get instructor's overall statistics
router.get('/stats', instructorAnalyticsController.getInstructorStats);

// GET /api/instructor-analytics/exercises - Get instructor's exercises with submission counts
router.get('/exercises', instructorAnalyticsController.getInstructorExercises);

// GET /api/instructor-analytics/submissions - Get recent submissions on instructor's exercises
router.get('/submissions', instructorAnalyticsController.getInstructorSubmissions);

// GET /api/instructor-analytics/performance - Get performance breakdown by exercise
router.get('/performance', instructorAnalyticsController.getInstructorExercisePerformance);

module.exports = router;