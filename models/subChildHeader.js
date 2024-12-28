const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SubChildHeader = sequelize.define(
  "subchildheader",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
    },
    link: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

module.exports = SubChildHeader;
