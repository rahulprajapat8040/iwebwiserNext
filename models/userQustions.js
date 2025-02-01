const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const UserQuestions = sequelize.define('userQuestions', {
    id: {
        type: DataTypes.UUID,
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
        type: DataTypes.UUID,
        allowNull: false
    },
}, { timestamps: true })

module.exports = UserQuestions