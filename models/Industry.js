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
    button_link: {
        type: DataTypes.STRING,
    },
    image: {
        type: DataTypes.STRING,
    },
    alt: {
        type: DataTypes.STRING
    },
    icon: {
        type: DataTypes.STRING
    },
    iconAlt: {
        type: DataTypes.STRING
    },
    index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: true,
    paranoid: true,
    tableName: 'industries' // Explicitly define the table name
});

module.exports = Industry;


