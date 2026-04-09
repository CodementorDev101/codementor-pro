const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  exercise_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  code: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  language: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'wrong_answer', 'error', 'timeout'),
    defaultValue: 'pending'
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
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
  tableName: 'submissions',
  timestamps: true,
  createdAt: 'submitted_at',
  updatedAt: false
});

module.exports = Submission;