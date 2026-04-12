const { Submission, Exercise, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get overall platform statistics
const getOverallStats = async (req, res) => {
  try {
    const totalSubmissions = await Submission.count();
    const totalExercises = await Exercise.count();
    const totalStudents = await User.count({
      where: { role: 'student' }
    });

    const passedSubmissions = await Submission.count({
      where: { status: 'accepted' }
    });

    const successRate = totalSubmissions > 0
      ? ((passedSubmissions / totalSubmissions) * 100).toFixed(1)
      : 0;

    const avgScoreResult = await Submission.findOne({
      attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'avgScore']],
      raw: true
    });

    const averageScore = avgScoreResult.avgScore
      ? parseFloat(avgScoreResult.avgScore).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        totalSubmissions,
        totalExercises,
        totalStudents,
        successRate: parseFloat(successRate),
        averageScore: parseFloat(averageScore)
      }
    });
  } catch (error) {
    console.error('Error fetching overall stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch overall statistics' });
  }
};

// Get exercise completion rates
const getExerciseCompletionRates = async (req, res) => {
  try {
    const query = `
      SELECT 
        e.id, e.title, e.difficulty, e.language,
        COUNT(s.id) as totalSubmissions,
        SUM(CASE WHEN s.status = 'accepted' THEN 1 ELSE 0 END) as passedSubmissions
      FROM exercises e
      LEFT JOIN submissions s ON e.id = s.exercise_id
      GROUP BY e.id, e.title, e.difficulty, e.language
    `;
    const [results] = await sequelize.query(query);

    const exercisesWithRates = results.map(exercise => {
      const totalSubmissions = parseInt(exercise.totalSubmissions) || 0;
      const passedSubmissions = parseInt(exercise.passedSubmissions) || 0;
      const completionRate = totalSubmissions > 0
        ? ((passedSubmissions / totalSubmissions) * 100).toFixed(1)
        : 0;
      return { id: exercise.id, title: exercise.title, difficulty: exercise.difficulty, language: exercise.language, totalSubmissions, passedSubmissions, completionRate: parseFloat(completionRate) };
    });

    exercisesWithRates.sort((a, b) => b.totalSubmissions - a.totalSubmissions);
    res.json({ success: true, data: exercisesWithRates });
  } catch (error) {
    console.error('Error fetching exercise completion rates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch exercise completion rates' });
  }
};

// Get most difficult exercises (lowest success rate)
const getMostDifficultExercises = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const query = `
      SELECT 
        e.id, e.title, e.difficulty, e.language,
        COUNT(s.id) as totalSubmissions,
        SUM(CASE WHEN s.status = 'accepted' THEN 1 ELSE 0 END) as passedSubmissions
      FROM exercises e
      INNER JOIN submissions s ON e.id = s.exercise_id
      GROUP BY e.id, e.title, e.difficulty, e.language
      HAVING COUNT(s.id) >= 5
    `;
    const [results] = await sequelize.query(query);

    const exercisesWithRates = results.map(exercise => {
      const totalSubmissions = parseInt(exercise.totalSubmissions) || 0;
      const passedSubmissions = parseInt(exercise.passedSubmissions) || 0;
      const successRate = totalSubmissions > 0
        ? ((passedSubmissions / totalSubmissions) * 100).toFixed(1)
        : 0;
      return { id: exercise.id, title: exercise.title, difficulty: exercise.difficulty, language: exercise.language, totalSubmissions, passedSubmissions, successRate: parseFloat(successRate) };
    });

    exercisesWithRates.sort((a, b) => a.successRate - b.successRate);
    res.json({ success: true, data: exercisesWithRates.slice(0, limit) });
  } catch (error) {
    console.error('Error fetching most difficult exercises:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch most difficult exercises' });
  }
};

// Get most popular exercises (most attempted)
const getMostPopularExercises = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const query = `
      SELECT 
        e.id, e.title, e.difficulty, e.language,
        COUNT(s.id) as totalAttempts
      FROM exercises e
      INNER JOIN submissions s ON e.id = s.exercise_id
      GROUP BY e.id, e.title, e.difficulty, e.language
      ORDER BY totalAttempts DESC
      LIMIT ?
    `;
    const [results] = await sequelize.query(query, { replacements: [limit] });

    const popularExercises = results.map(exercise => ({
      id: exercise.id, title: exercise.title, difficulty: exercise.difficulty,
      language: exercise.language, totalAttempts: parseInt(exercise.totalAttempts)
    }));

    res.json({ success: true, data: popularExercises });
  } catch (error) {
    console.error('Error fetching most popular exercises:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch most popular exercises' });
  }
};

// Get student performance overview
const getStudentPerformance = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, u.first_name, u.last_name, u.email,
        COUNT(s.id) as totalSubmissions,
        SUM(CASE WHEN s.status = 'accepted' THEN 1 ELSE 0 END) as passedSubmissions,
        AVG(s.score) as avgScore
      FROM users u
      LEFT JOIN submissions s ON u.id = s.user_id
      WHERE u.role = 'student'
      GROUP BY u.id, u.first_name, u.last_name, u.email
    `;
    const [results] = await sequelize.query(query);

    const studentPerformance = results.map(student => {
      const totalSubmissions = parseInt(student.totalSubmissions) || 0;
      const passedSubmissions = parseInt(student.passedSubmissions) || 0;
      const successRate = totalSubmissions > 0
        ? ((passedSubmissions / totalSubmissions) * 100).toFixed(1) : 0;
      const avgScore = student.avgScore ? parseFloat(student.avgScore).toFixed(1) : 0;
      return { id: student.id, name: `${student.first_name} ${student.last_name}`, email: student.email, totalSubmissions, passedSubmissions, successRate: parseFloat(successRate), avgScore: parseFloat(avgScore) };
    });

    studentPerformance.sort((a, b) => b.avgScore - a.avgScore);
    res.json({ success: true, data: studentPerformance });
  } catch (error) {
    console.error('Error fetching student performance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student performance' });
  }
};

// Get submissions over time (for trend chart)
const getSubmissionsTrend = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const submissions = await Submission.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('submitted_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        submitted_at: {
          [Op.gte]: sequelize.literal(`DATE_SUB(NOW(), INTERVAL ${days} DAY)`)
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('submitted_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('submitted_at')), 'ASC']],
      raw: true
    });

    const trendData = submissions.map(item => ({ date: item.date, count: parseInt(item.count) }));
    res.json({ success: true, data: trendData });
  } catch (error) {
    console.error('Error fetching submissions trend:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch submissions trend' });
  }
};

// Get language distribution
const getLanguageDistribution = async (req, res) => {
  try {
    const distribution = await Exercise.findAll({
      attributes: ['language', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['language'],
      raw: true
    });
    const languageData = distribution.map(item => ({ language: item.language, count: parseInt(item.count) }));
    res.json({ success: true, data: languageData });
  } catch (error) {
    console.error('Error fetching language distribution:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch language distribution' });
  }
};

// Get difficulty distribution
const getDifficultyDistribution = async (req, res) => {
  try {
    const distribution = await Exercise.findAll({
      attributes: ['difficulty', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['difficulty'],
      raw: true
    });
    const difficultyData = distribution.map(item => ({ difficulty: item.difficulty, count: parseInt(item.count) }));
    res.json({ success: true, data: difficultyData });
  } catch (error) {
    console.error('Error fetching difficulty distribution:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch difficulty distribution' });
  }
};

// Public stats — no auth required (for landing page)
const getPublicStats = async (req, res) => {
  try {
    const totalSubmissions = await Submission.count();

    const acceptedSubmissions = await Submission.count({
      where: { status: 'accepted' }
    });

    const successRate = totalSubmissions > 0
      ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
      : 0;

    res.json({
      success: true,
      data: { totalSubmissions, successRate }
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

module.exports = {
  getOverallStats,
  getExerciseCompletionRates,
  getMostDifficultExercises,
  getMostPopularExercises,
  getStudentPerformance,
  getSubmissionsTrend,
  getLanguageDistribution,
  getDifficultyDistribution,
  getPublicStats
};