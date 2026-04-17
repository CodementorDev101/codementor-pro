const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClassMembership = sequelize.define('ClassMembership', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    class_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // 'active'  = currently a member
    // 'pending' = instructor invited, waiting for student response
    // 'declined'= student declined the invite
    status: {
        type: DataTypes.ENUM('active', 'pending', 'declined'),
        defaultValue: 'pending'
    },
    // null = student joined via invite code
    // integer = instructor_id who sent the manual invite
    invited_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    joined_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    }
}, {
    tableName: 'class_memberships',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = ClassMembership;