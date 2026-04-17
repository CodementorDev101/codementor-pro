const { Op } = require('sequelize');
const { Exercise, TestCase, User, Class, ClassMembership } = require('../models');

/**
 * Create a new exercise (public or private to a class)
 */
const createExercise = async (req, res) => {
  try {
    const { title, description, difficulty, language, time_limit, memory_limit, test_cases, class_id } = req.body;

    // Validate input
    if (!title || !description || !language) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and language.'
      });
    }

    // If class_id is provided, verify the class belongs to this instructor
    if (class_id) {
      const classItem = await Class.findOne({ where: { id: class_id, instructor_id: req.user.id } });
      if (!classItem) {
        return res.status(403).json({
          success: false,
          message: 'Class not found or you do not own this class.'
        });
      }
    }

    // Create exercise
    const exercise = await Exercise.create({
      title,
      description,
      difficulty: difficulty || 'easy',
      language,
      time_limit: time_limit || 5,
      memory_limit: memory_limit || 128000,
      created_by: req.user.id,
      class_id: class_id || null
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
 * Get all PUBLIC exercises (class_id is null)
 * Dashboard only shows public exercises
 */
const getAllExercises = async (req, res) => {
  try {
    const { difficulty, language, search } = req.query;

    console.log('User role:', req.user.role, '| User ID:', req.user.id);

    const whereClause = {
      class_id: null  // Only public exercises on the dashboard
    };

    if (difficulty) whereClause.difficulty = difficulty;
    if (language) whereClause.language = language;
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Instructors only see their own public exercises
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
 * Get exercises for a specific private class
 * Only accessible to members of that class and the instructor who owns it
 */
const getClassExercises = async (req, res) => {
  try {
    const { class_id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify the class exists
    const classItem = await Class.findByPk(class_id);
    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Class not found.' });
    }

    // Check access: instructor must own the class, student must be an active member
    if (userRole === 'instructor') {
      if (classItem.instructor_id !== userId) {
        return res.status(403).json({ success: false, message: 'You do not own this class.' });
      }
    } else if (userRole === 'student') {
      const membership = await ClassMembership.findOne({
        where: { class_id, student_id: userId, status: 'active' }
      });
      if (!membership) {
        return res.status(403).json({ success: false, message: 'You are not a member of this class.' });
      }
    } else {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Fetch exercises belonging to this class
    const exercises = await Exercise.findAll({
      where: { class_id },
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
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      class: classItem,
      exercises
    });

  } catch (error) {
    console.error('getClassExercises error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch class exercises.' });
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

    // If the exercise is private (has a class_id), verify access
    if (exercise.class_id) {
      const userId = req.user.id;
      const userRole = req.user.role;

      if (userRole === 'instructor') {
        const classItem = await Class.findOne({ where: { id: exercise.class_id, instructor_id: userId } });
        if (!classItem) {
          return res.status(403).json({ success: false, message: 'Access denied.' });
        }
      } else if (userRole === 'student') {
        const membership = await ClassMembership.findOne({
          where: { class_id: exercise.class_id, student_id: userId, status: 'active' }
        });
        if (!membership) {
          return res.status(403).json({ success: false, message: 'You are not a member of the class this exercise belongs to.' });
        }
      }
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
    const { title, description, difficulty, language, time_limit, memory_limit, test_cases } = req.body;

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

    // Update test cases if provided
    if (test_cases && Array.isArray(test_cases) && test_cases.length > 0) {
      await TestCase.destroy({ where: { exercise_id: exercise.id } });

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
  getClassExercises,
  getExerciseById,
  updateExercise,
  deleteExercise
};