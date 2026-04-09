const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TestCase = sequelize.define('TestCase', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  exercise_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  input: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  expected_output: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_sample: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  }
}, {
  tableName: 'test_cases',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = TestCase;