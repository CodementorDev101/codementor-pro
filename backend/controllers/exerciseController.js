const { Exercise, TestCase, User } = require('../models');

/**
 * Create a new exercise
 */
const createExercise = async (req, res) => {
  try {
    const { title, description, difficulty, language, time_limit, memory_limit, test_cases } = req.body;

    // Validate input
    if (!title || !description || !language) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and language.'
      });
    }

    // Create exercise
    const exercise = await Exercise.create({
      title,
      description,
      difficulty: difficulty || 'easy',
      language,
      time_limit: time_limit || 5,
      memory_limit: memory_limit || 128000,
      created_by: req.user.id
    });

    // Create test cases if provided
    if (test_cases && Array.isArray(test_cases) && test_cases.length > 0) {
      const testCasesData = test_cases.map(tc => ({
        exercise_id: exercise.id,
        input: tc.input || '',
        expected_output: tc.expected_output,
        is_sample: tc.is_sample || false,
        points: tc.points || 10
      }));

      await TestCase.bulkCreate(testCasesData);
    }

    res.status(201).json({
      success: true,
      message: 'Exercise created successfully.',
      data: { exercise }
    });

  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create exercise.',
      error: error.message
    });
  }
};

/**
 * Get all exercises
 */
const getAllExercises = async (req, res) => {
  try {
    const { difficulty, language } = req.query;

    // ADD THIS LINE TEMPORARILY
    console.log('User role:', req.user.role, '| User ID:', req.user.id);

    const whereClause = {};
    if (difficulty) whereClause.difficulty = difficulty;
    if (language) whereClause.language = language;

    if (req.user.role === 'instructor') {
      whereClause.created_by = req.user.id;
    }

    const exercises = await Exercise.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: { exercises }
    });

  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercises.',
      error: error.message
    });
  }
};

/**
 * Get single exercise with test cases
 */
const getExerciseById = async (req, res) => {
  try {
    const { id } = req.params;

    const exercise = await Exercise.findByPk(id, {
      include: [
        {
          model: TestCase,
          as: 'testCases',
          attributes: ['id', 'input', 'expected_output', 'is_sample', 'points']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name']
        }
      ]
    });

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: { exercise }
    });

  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercise.',
      error: error.message
    });
  }
};

/**
 * Update exercise
 */
const updateExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, difficulty, language, time_limit, memory_limit, test_cases } = req.body; // ✅ ADDED: test_cases

    const exercise = await Exercise.findByPk(id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found.'
      });
    }

    // Check if user is creator or admin
    if (exercise.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this exercise.'
      });
    }

    // Update exercise details
    await exercise.update({
      title: title || exercise.title,
      description: description || exercise.description,
      difficulty: difficulty || exercise.difficulty,
      language: language || exercise.language,
      time_limit: time_limit || exercise.time_limit,
      memory_limit: memory_limit || exercise.memory_limit
    });

    // ✅ ADDED: Update test cases if provided
    if (test_cases && Array.isArray(test_cases) && test_cases.length > 0) {
      // Delete existing test cases
      await TestCase.destroy({
        where: { exercise_id: exercise.id }
      });

      // Create new test cases
      const testCasesData = test_cases.map(tc => ({
        exercise_id: exercise.id,
        input: tc.input || '',
        expected_output: tc.expected_output,
        is_sample: tc.is_sample || false,
        points: tc.points || 10
      }));

      await TestCase.bulkCreate(testCasesData);
    }

    res.status(200).json({
      success: true,
      message: 'Exercise updated successfully.',
      data: { exercise }
    });

  } catch (error) {
    console.error('Update exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update exercise.',
      error: error.message
    });
  }
};

/**
 * Delete exercise
 */
const deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;

    const exercise = await Exercise.findByPk(id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found.'
      });
    }

    // Check if user is creator or admin
    if (exercise.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this exercise.'
      });
    }

    await exercise.destroy();

    res.status(200).json({
      success: true,
      message: 'Exercise deleted successfully.'
    });

  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete exercise.',
      error: error.message
    });
  }
};

module.exports = {
  createExercise,
  getAllExercises,
  getExerciseById,
  updateExercise,
  deleteExercise
};