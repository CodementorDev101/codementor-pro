const { Submission, Exercise, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get instructor's overall statistics
const getInstructorStats = async (req, res) => {
  try {
    const instructorId = req.user.id; // Get from JWT token

    // Count total exercises created by instructor
    const totalExercises = await Exercise.count({
      where: { created_by: instructorId }
    });

    // Get all exercise IDs created by instructor
    const instructorExercises = await Exercise.findAll({
      where: { created_by: instructorId },
      attributes: ['id'],
      raw: true
    });

    const exerciseIds = instructorExercises.map(ex => ex.id);

    // Count total submissions on instructor's exercises
    const totalSubmissions = exerciseIds.length > 0
      ? await Submission.count({
        where: { exercise_id: { [Op.in]: exerciseIds } }
      })
      : 0;

    // Count passed submissions
    const passedSubmissions = exerciseIds.length > 0
      ? await Submission.count({
        where: {
          exercise_id: { [Op.in]: exerciseIds },
          status: 'accepted'
        }
      })
      : 0;

    // Calculate success rate
    const successRate = totalSubmissions > 0
      ? ((passedSubmissions / totalSubmissions) * 100).toFixed(1)
      : 0;

    // Calculate average score
    const avgScoreResult = exerciseIds.length > 0
      ? await Submission.findOne({
        attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'avgScore']],
        where: { exercise_id: { [Op.in]: exerciseIds } },
        raw: true
      })
      : { avgScore: 0 };

    const averageScore = avgScoreResult?.avgScore
      ? parseFloat(avgScoreResult.avgScore).toFixed(1)
      : 0;

    // Count unique students who attempted instructor's exercises
    const uniqueStudents = exerciseIds.length > 0
      ? await Submission.count({
        where: { exercise_id: { [Op.in]: exerciseIds } },
        distinct: true,
        col: 'user_id'
      })
      : 0;

    res.json({
      success: true,
      data: {
        totalExercises,
        totalSubmissions,
        successRate: parseFloat(successRate),
        averageScore: parseFloat(averageScore),
        uniqueStudents
      }
    });
  } catch (error) {
    console.error('Error fetching instructor stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instructor statistics'
    });
  }
};

// Get instructor's exercises with submission counts
const getInstructorExercises = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const query = `
      SELECT 
        e.id,
        e.title,
        e.difficulty,
        e.language,
        e.created_at,
        COUNT(s.id) as totalSubmissions,
        SUM(CASE WHEN s.status = 'accepted' THEN 1 ELSE 0 END) as passedSubmissions
      FROM exercises e
      LEFT JOIN submissions s ON e.id = s.exercise_id
      WHERE e.created_by = ?
      GROUP BY e.id, e.title, e.difficulty, e.language, e.created_at
      ORDER BY e.created_at DESC
    `;

    const [results] = await sequelize.query(query, {
      replacements: [instructorId]
    });

    const exercises = results.map(exercise => {
      const totalSubmissions = parseInt(exercise.totalSubmissions) || 0;
      const passedSubmissions = parseInt(exercise.passedSubmissions) || 0;
      const successRate = totalSubmissions > 0
        ? ((passedSubmissions / totalSubmissions) * 100).toFixed(1)
        : 0;

      return {
        id: exercise.id,
        title: exercise.title,
        difficulty: exercise.difficulty,
        language: exercise.language,
        createdAt: exercise.created_at,
        totalSubmissions,
        passedSubmissions,
        successRate: parseFloat(successRate)
      };
    });

    res.json({
      success: true,
      data: exercises
    });
  } catch (error) {
    console.error('Error fetching instructor exercises:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch instructor exercises'
    });
  }
};

// Get recent submissions on instructor's exercises
const getInstructorSubmissions = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const query = `
      SELECT 
        s.id,
        s.status,
        s.score,
        s.submitted_at,
        e.id as exercise_id,
        e.title as exercise_title,
        e.difficulty,
        u.id as student_id,
        u.first_name,
        u.last_name,
        u.email
      FROM submissions s
      INNER JOIN exercises e ON s.exercise_id = e.id
      INNER JOIN users u ON s.user_id = u.id
      WHERE e.created_by = ?
      ORDER BY s.submitted_at DESC
      LIMIT ?
    `;

    const [results] = await sequelize.query(query, {
      replacements: [instructorId, limit]
    });

    const submissions = results.map(sub => ({
      id: sub.id,
      status: sub.status,
      score: parseFloat(sub.score),
      submittedAt: sub.submitted_at,
      exercise: {
        id: sub.exercise_id,
        title: sub.exercise_title,
        difficulty: sub.difficulty
      },
      student: {
        id: sub.student_id,
        name: `${sub.first_name} ${sub.last_name}`,
        email: sub.email
      }
    }));

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Error fetching instructor submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions'
    });
  }
};

// Get performance breakdown by exercise
const getInstructorExercisePerformance = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const query = `
      SELECT 
        e.id,
        e.title,
        e.difficulty,
        COUNT(s.id) as attempts,
        SUM(CASE WHEN s.status = 'accepted' THEN 1 ELSE 0 END) as passed,
        AVG(s.score) as avgScore
      FROM exercises e
      LEFT JOIN submissions s ON e.id = s.exercise_id
      WHERE e.created_by = ?
      GROUP BY e.id, e.title, e.difficulty
      HAVING COUNT(s.id) > 0
      ORDER BY attempts DESC
    `;

    const [results] = await sequelize.query(query, {
      replacements: [instructorId]
    });

    const performance = results.map(ex => ({
      id: ex.id,
      title: ex.title,
      difficulty: ex.difficulty,
      attempts: parseInt(ex.attempts),
      passed: parseInt(ex.passed),
      successRate: ex.attempts > 0
        ? ((ex.passed / ex.attempts) * 100).toFixed(1)
        : 0,
      avgScore: ex.avgScore ? parseFloat(ex.avgScore).toFixed(1) : 0
    }));

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Error fetching exercise performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercise performance'
    });
  }
};

module.exports = {
  getInstructorStats,
  getInstructorExercises,
  getInstructorSubmissions,
  getInstructorExercisePerformance
};