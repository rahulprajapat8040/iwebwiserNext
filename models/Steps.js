const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Steps = sequelize.define('steps', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.TEXT('long'),
    },
    image :{
        type: DataTypes.STRING,
    }
}, {
    timestamps: true,
    paranoid: true
});

module.exports = Steps;