const express = require('express');
const router = express.Router();
const {
  submitCode,
  getUserSubmissions,
  getSubmissionById,
  getAllSubmissions
} = require('../controllers/submissionController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Student routes
router.post('/submit', authenticate, submitCode);
router.get('/my-submissions', authenticate, getUserSubmissions);
router.get('/:id', authenticate, getSubmissionById);

// Admin/Instructor routes
router.get('/', authenticate, authorize('instructor', 'admin'), getAllSubmissions);

module.exports = router;