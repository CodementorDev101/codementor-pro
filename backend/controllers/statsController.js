const { User, Exercise, Submission } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Get statistics for student users
 * Returns: total exercises, completed exercises, accuracy rate, current streak
 */
exports.getStudentStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Total exercises available
    const totalExercises = await Exercise.count();

    // 2. Get user's submissions with their latest attempt per exercise
    const submissions = await Submission.findAll({
      where: { user_id: userId },
      attributes: [
        'exercise_id',
        [sequelize.fn('MAX', sequelize.col('score')), 'best_score'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'attempt_count']
      ],
      group: ['exercise_id'],
      raw: true
    });

    // 3. Count completed exercises (score >= 70%)
    const completedExercises = submissions.filter(s => s.best_score >= 70).length;

    // 4. Calculate accuracy rate (average of best scores)
    let accuracyRate = 0;
    if (submissions.length > 0) {
      const totalScore = submissions.reduce((sum, s) => sum + parseFloat(s.best_score), 0);
      accuracyRate = Math.round(totalScore / submissions.length);
    }

    // 5. Current streak (placeholder - can be enhanced later)
    const currentStreak = 0; // TODO: Implement streak calculation based on consecutive days

    res.json({
      success: true,
      data: {
        totalExercises,
        completedExercises,
        accuracyRate,
        currentStreak,
        attemptedExercises: submissions.length
      }
    });

  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student statistics'
    });
  }
};

/**
 * Get statistics for instructor users
 * Returns: exercises created, total students, submissions received, avg performance
 */
exports.getInstructorStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Total exercises created by this instructor
    const exercisesCreated = await Exercise.count({
      where: { created_by: userId }
    });

    // 2. Total students in the system
    const totalStudents = await User.count({
      where: { role: 'student' }
    });

    // 3. Total submissions received on instructor's exercises
    const instructorExercises = await Exercise.findAll({
      where: { created_by: userId },
      attributes: ['id']
    });
    
    const exerciseIds = instructorExercises.map(ex => ex.id);
    
    const submissionsReceived = await Submission.count({
      where: {
        exercise_id: {
          [Op.in]: exerciseIds
        }
      }
    });

    // 4. Average student performance on instructor's exercises
    let avgPerformance = 0;
    if (exerciseIds.length > 0) {
      const performanceData = await Submission.findOne({
        where: {
          exercise_id: {
            [Op.in]: exerciseIds
          }
        },
        attributes: [
          [sequelize.fn('AVG', sequelize.col('score')), 'avg_score']
        ],
        raw: true
      });
      
      avgPerformance = performanceData.avg_score 
        ? Math.round(parseFloat(performanceData.avg_score)) 
        : 0;
    }

    res.json({
      success: true,
      data: {
        exercisesCreated,
        totalStudents,
        submissionsReceived,
        avgPerformance
      }
    });

  } catch (error) {
    console.error('Get instructor stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instructor statistics'
    });
  }
};

/**
 * Get statistics for admin users
 * Returns: total users (by role), total exercises, total submissions, recent activity
 */
exports.getAdminStats = async (req, res) => {
  try {
    // 1. Total users by role
    const totalUsers = await User.count();
    const studentCount = await User.count({ where: { role: 'student' } });
    const instructorCount = await User.count({ where: { role: 'instructor' } });
    const adminCount = await User.count({ where: { role: 'admin' } });

    // 2. Total exercises
    const totalExercises = await Exercise.count();

    // 3. Total submissions
    const totalSubmissions = await Submission.count();

    // 4. System activity (submissions in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = await Submission.count({
      where: {
        submitted_at: {
          [Op.gte]: sevenDaysAgo
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        usersByRole: {
          students: studentCount,
          instructors: instructorCount,
          admins: adminCount
        },
        totalExercises,
        totalSubmissions,
        recentActivity
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics'
    });
  }
};

/**
 * Main stats endpoint - routes to appropriate function based on user role
 */
exports.getStats = async (req, res) => {
  try {
    const userRole = req.user.role;

    // Route to appropriate stats function based on role
    switch (userRole) {
      case 'student':
        return exports.getStudentStats(req, res);
      case 'instructor':
        return exports.getInstructorStats(req, res);
      case 'admin':
        return exports.getAdminStats(req, res);
      default:
        return res.status(403).json({
          success: false,
          message: 'Invalid user role'
        });
    }

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};