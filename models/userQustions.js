const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const UserQuestions = sequelize.define('userQuestions', {
    id: {
        type: DataTypes.STRING(36).BINARY,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    question: {
        type: DataTypes.TEXT("long")
    },
    answer: {
        type: DataTypes.TEXT("long")
    },
    keywords: {
        type: DataTypes.JSON
    },
    userId: {
        type: DataTypes.STRING(36).BINARY,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    }
}, {
    timestamps: true
})

module.exports = UserQuestions