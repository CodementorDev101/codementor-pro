const User = require('./User');
const Exercise = require('./Exercise');
const TestCase = require('./TestCase');
const Submission = require('./Submission');
const SubmissionResult = require('./SubmissionResult');
const Class = require('./Class');
const ClassMembership = require('./ClassMembership');

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

// User <-> Class (One-to-Many: Instructor creates many Classes)
User.hasMany(Class, { foreignKey: 'instructor_id', as: 'classes' });
Class.belongsTo(User, { foreignKey: 'instructor_id', as: 'instructor' });

// Class <-> ClassMembership (One-to-Many: Class has many Memberships)
Class.hasMany(ClassMembership, { foreignKey: 'class_id', as: 'memberships' });
ClassMembership.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });

// User <-> ClassMembership (One-to-Many: Student has many Memberships)
User.hasMany(ClassMembership, { foreignKey: 'student_id', as: 'classMemberships' });
ClassMembership.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

// Class <-> Exercise (One-to-Many: Class has many private Exercises)
Class.hasMany(Exercise, { foreignKey: 'class_id', as: 'classExercises' });
Exercise.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });

module.exports = {
  User,
  Exercise,
  TestCase,
  Submission,
  SubmissionResult,
  Class,
  ClassMembership
};