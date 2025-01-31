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
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
})

module.exports = UserQuestions