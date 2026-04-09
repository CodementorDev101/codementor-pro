const express = require('express');
const router = express.Router();
const {
  createExercise,
  getAllExercises,
  getExerciseById,
  updateExercise,
  deleteExercise
} = require('../controllers/exerciseController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes - any authenticated user can view exercises
router.get('/', authenticate, getAllExercises);
router.get('/:id', authenticate, getExerciseById);

// Protected routes - only instructors and admins
router.post('/', authenticate, authorize('instructor', 'admin'), createExercise);
router.put('/:id', authenticate, authorize('instructor', 'admin'), updateExercise);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteExercise);

module.exports = router;