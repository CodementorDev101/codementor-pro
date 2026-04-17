const express = require('express');
const router = express.Router();
const {
    createClass,
    getMyClassesAsInstructor,
    getClassDetails,
    deleteClass,
    inviteStudent,
    joinViaCode,
    respondToInvite,
    getMyClassesAsStudent,
    leaveClass,
    removeMember
} = require('../controllers/classController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// ─── INSTRUCTOR ROUTES ───────────────────────────────────────────────────────
router.post('/', authenticate, authorize('instructor'), createClass);
router.get('/my-classes', authenticate, authorize('instructor'), getMyClassesAsInstructor);
router.get('/:id', authenticate, authorize('instructor'), getClassDetails);
router.delete('/:id', authenticate, authorize('instructor'), deleteClass);
router.post('/:id/invite', authenticate, authorize('instructor'), inviteStudent);
router.delete('/:id/members/:student_id', authenticate, authorize('instructor'), removeMember);

// ─── STUDENT ROUTES ──────────────────────────────────────────────────────────
router.post('/join', authenticate, authorize('student'), joinViaCode);
router.post('/:id/respond', authenticate, authorize('student'), respondToInvite);
router.get('/student/my-classes', authenticate, authorize('student'), getMyClassesAsStudent);
router.delete('/:id/leave', authenticate, authorize('student'), leaveClass);

module.exports = router;