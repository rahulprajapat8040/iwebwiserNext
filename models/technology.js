const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Technology = sequelize.define('technology', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    sub_service_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    title: {
        type: DataTypes.STRING,
    },
    image: {
        type: DataTypes.STRING,
    },
    alt: {
        type: DataTypes.STRING
    },
    index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: true,
    paranoid: true
});


module.exports = Technology;


