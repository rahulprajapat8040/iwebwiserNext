const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Certificate = sequelize.define('certificate', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
    },
    image :{
        type: DataTypes.STRING,
    }
}, {
    timestamps: true,
    paranoid: true
});


module.exports = Certificate;


