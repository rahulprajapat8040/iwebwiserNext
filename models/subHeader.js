const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SubHeader = sequelize.define('subheader', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
    },
    link :{
        type: DataTypes.STRING,
    },
    subMenuHeaders: {
        type: DataTypes.JSON,
    }
}, {
    timestamps: true,
    paranoid: true
});


module.exports = SubHeader;


