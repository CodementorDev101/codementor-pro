const { Submission, SubmissionResult, Exercise, TestCase, User } = require('../models');
const { executeCode } = require('../services/pistonService');

/**
 * Submit code for an exercise
 */
const submitCode = async (req, res) => {
  try {
    const { exercise_id, code, language } = req.body;

    // Validate input
    if (!exercise_id || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Please provide exercise_id, code, and language.'
      });
    }

    // Get exercise with test cases
    const exercise = await Exercise.findByPk(exercise_id, {
      include: [{ model: TestCase, as: 'testCases' }]
    });

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found.'
      });
    }

    if (exercise.testCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No test cases found for this exercise.'
      });
    }

    // Create submission record
    const submission = await Submission.create({
      user_id: req.user.id,
      exercise_id,
      code,
      language,
      status: 'pending'
    });

    // Run code against each test case
    let totalScore = 0;
    let totalPoints = 0;
    let allPassed = true;
    const results = [];

    for (const testCase of exercise.testCases) {
      totalPoints += testCase.points;

      // Execute code with test case input
      const executionResult = await executeCode(language, code, testCase.input);

      // Compare output
      const actualOutput = executionResult.stdout.trim();
      const expectedOutput = testCase.expected_output.trim();
      const passed = actualOutput === expectedOutput;

      if (!passed) {
        allPassed = false;
      } else {
        totalScore += testCase.points;
      }

      // Save result
      await SubmissionResult.create({
        submission_id: submission.id,
        test_case_id: testCase.id,
        status: passed ? 'accepted' : 'wrong_answer',
        output: actualOutput,
        execution_time: executionResult.execution_time,
        memory_used: executionResult.memory_used
      });

      results.push({
        test_case_id: testCase.id,
        passed,
        input: testCase.is_sample ? testCase.input : '[Hidden]',
        expected_output: testCase.is_sample ? expectedOutput : '[Hidden]',
        actual_output: actualOutput,
        is_sample: testCase.is_sample
      });
    }

    // Calculate final score percentage
    const scorePercentage = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;

    // Update submission status
    await submission.update({
      status: allPassed ? 'accepted' : 'wrong_answer',
      score: scorePercentage
    });

    res.status(200).json({
      success: true,
      message: 'Code submitted successfully.',
      data: {
        submission_id: submission.id,
        status: allPassed ? 'accepted' : 'wrong_answer',
        score: scorePercentage.toFixed(2),
        total_test_cases: exercise.testCases.length,
        passed_test_cases: results.filter(r => r.passed).length,
        results
      }
    });

  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({
      success: false,
      message: 'Code submission failed.',
      error: error.message
    });
  }
};

/**
 * Get user's submissions
 */
const getUserSubmissions = async (req, res) => {
  try {
    const { exercise_id } = req.query;

    const whereClause = { user_id: req.user.id };
    if (exercise_id) whereClause.exercise_id = exercise_id;

    const submissions = await Submission.findAll({
      where: whereClause,
      include: [
        {
          model: Exercise,
          as: 'exercise',
          attributes: ['id', 'title', 'difficulty', 'language']
        },
        {
          model: SubmissionResult,
          as: 'results',
          attributes: ['status']
        }
      ],
      order: [['submitted_at', 'DESC']]
    });

    // Format submissions for frontend compatibility
    const formattedSubmissions = submissions.map(sub => {
      const subData = sub.toJSON();
      
      // Calculate test case counts
      const passedCount = subData.results ? subData.results.filter(r => r.status === 'accepted').length : 0;
      const totalCount = subData.results ? subData.results.length : 0;
      
      return {
        id: subData.id,
        user_id: subData.user_id,
        exercise_id: subData.exercise_id,
        code: subData.code,
        language: subData.language,
        status: subData.status,
        score: parseFloat(subData.score),
        created_at: subData.submitted_at,
        Exercise: subData.exercise, // Map 'exercise' to 'Exercise' for frontend
        passed_test_cases: passedCount,
        total_test_cases: totalCount
      };
    });

    res.status(200).json({
      success: true,
      data: { submissions: formattedSubmissions }
    });

  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions.',
      error: error.message
    });
  }
};

/**
 * Get submission details with results
 */
const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findByPk(id, {
      include: [
        {
          model: Exercise,
          as: 'exercise',
          attributes: ['id', 'title', 'description', 'difficulty', 'language']
        },
        {
          model: SubmissionResult,
          as: 'results',
          include: [
            {
              model: TestCase,
              as: 'testCase'
            }
          ]
        }
      ]
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.'
      });
    }

    // Check if user owns this submission or is admin/instructor
    if (submission.user_id !== req.user.id && !['admin', 'instructor'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    // Format submission for frontend compatibility
    const subData = submission.toJSON();
    
    // Format results with proper structure
    const formattedResults = subData.results.map(result => ({
      passed: result.status === 'accepted',
      input: result.testCase.is_sample ? result.testCase.input : null,
      expected_output: result.testCase.expected_output,
      actual_output: result.output,
      is_sample: result.testCase.is_sample
    }));

    const formattedSubmission = {
      id: subData.id,
      user_id: subData.user_id,
      exercise_id: subData.exercise_id,
      code: subData.code,
      language: subData.language,
      status: subData.status,
      score: parseFloat(subData.score),
      created_at: subData.submitted_at,
      Exercise: subData.exercise, // Map 'exercise' to 'Exercise' for frontend
      passed_test_cases: formattedResults.filter(r => r.passed).length,
      total_test_cases: formattedResults.length,
      results: formattedResults
    };

    res.status(200).json({
      success: true,
      data: { submission: formattedSubmission }
    });

  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission.',
      error: error.message
    });
  }
};

/**
 * Get all submissions (Admin/Instructor only)
 */
const getAllSubmissions = async (req, res) => {
  try {
    const { exercise_id, user_id } = req.query;

    const whereClause = {};
    if (exercise_id) whereClause.exercise_id = exercise_id;
    if (user_id) whereClause.user_id = user_id;

    const submissions = await Submission.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: Exercise,
          as: 'exercise',
          attributes: ['id', 'title', 'difficulty', 'language']
        }
      ],
      order: [['submitted_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: { submissions }
    });

  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions.',
      error: error.message
    });
  }
};

module.exports = {
  submitCode,
  getUserSubmissions,
  getSubmissionById,
  getAllSubmissions
};