const User = require('./User');
const Exercise = require('./Exercise');
const TestCase = require('./TestCase');
const Submission = require('./Submission');
const SubmissionResult = require('./SubmissionResult');

// Define relationships

// User <-> Exercise (One-to-Many: User creates many Exercises)
User.hasMany(Exercise, { foreignKey: 'created_by', as: 'exercises' });
Exercise.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Exercise <-> TestCase (One-to-Many: Exercise has many TestCases)
Exercise.hasMany(TestCase, { foreignKey: 'exercise_id', as: 'testCases' });
TestCase.belongsTo(Exercise, { foreignKey: 'exercise_id', as: 'exercise' });

// User <-> Submission (One-to-Many: User makes many Submissions)
User.hasMany(Submission, { foreignKey: 'user_id', as: 'submissions' });
Submission.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Exercise <-> Submission (One-to-Many: Exercise has many Submissions)
Exercise.hasMany(Submission, { foreignKey: 'exercise_id', as: 'submissions' });
Submission.belongsTo(Exercise, { foreignKey: 'exercise_id', as: 'exercise' });

// Submission <-> SubmissionResult (One-to-Many: Submission has many Results)
Submission.hasMany(SubmissionResult, { foreignKey: 'submission_id', as: 'results' });
SubmissionResult.belongsTo(Submission, { foreignKey: 'submission_id', as: 'submission' });

// TestCase <-> SubmissionResult (One-to-Many: TestCase has many Results)
TestCase.hasMany(SubmissionResult, { foreignKey: 'test_case_id', as: 'results' });
SubmissionResult.belongsTo(TestCase, { foreignKey: 'test_case_id', as: 'testCase' });

module.exports = {
  User,
  Exercise,
  TestCase,
  Submission,
  SubmissionResult
};