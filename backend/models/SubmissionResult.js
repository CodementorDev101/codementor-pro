const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SubmissionResult = sequelize.define('SubmissionResult', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  submission_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  test_case_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  output: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  execution_time: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true
  },
  memory_used: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'submission_results',
  timestamps: false
});

module.exports = SubmissionResult;