const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OurClient = sequelize.define('ourClient', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
    },
    image: {
        type: DataTypes.STRING,
    },
    alt: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true,
    paranoid: true
});


module.exports = OurClient;


