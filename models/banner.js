const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Banner = sequelize.define('banner', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.STRING,
    },
    button_link: {
        type: DataTypes.STRING,
    },
    status:{
        type : DataTypes.BOOLEAN,
        defaultValue : true
    },
    image :{
        type: DataTypes.STRING,
    }
}, {
    timestamps: true,
    paranoid: true
});


module.exports = Banner;


