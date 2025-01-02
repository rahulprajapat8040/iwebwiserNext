const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Industry = sequelize.define('industry', {
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
    service_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    button_link: {
        type: DataTypes.STRING,
    },
    image :{
        type: DataTypes.STRING,
    }
}, {
    timestamps: true,
    paranoid: true
});

module.exports = Industry;


