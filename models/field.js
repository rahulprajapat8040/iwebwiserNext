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
    short_description: {
        type: DataTypes.TEXT('long'),
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
    },
    alt: {
        type: DataTypes.STRING
    },
    metas: {
        type: DataTypes.TEXT('long'),
        validate: {
            len: [0, 1000000000] // Adjusted validation rule to allow longer text
        }
    }
}, {
    timestamps: true,
    paranoid: true
});

module.exports = Field;