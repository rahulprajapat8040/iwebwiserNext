const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Field = sequelize.define('field', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    slug: {
        type: DataTypes.STRING,
    },
    title: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.TEXT('long'),
    },  
    buttonText: {
        type: DataTypes.STRING,
    },
    buttonLink: {
        type: DataTypes.STRING,
    },
    image: {
        type: DataTypes.STRING,
    }
}, {
    timestamps: true,
    paranoid: true
}); 

module.exports = Field;