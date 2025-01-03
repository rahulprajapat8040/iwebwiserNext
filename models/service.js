const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Service = sequelize.define("services", {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
  },
  short_description: {
    type: DataTypes.TEXT("long"),
  },
  long_description: {
    type: DataTypes.TEXT("long"),
  },
  button_link: {
    type: DataTypes.STRING,
  },
  image: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
  paranoid: true,
});

module.exports = Service;
