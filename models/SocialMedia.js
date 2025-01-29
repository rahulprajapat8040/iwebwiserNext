const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SocialMedia = sequelize.define(
  "socialMedia",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    link: {
      type: DataTypes.STRING,
    },
    title: {
      type: DataTypes.STRING
    },
    icon:{
      type: DataTypes.STRING
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    index: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

module.exports = SocialMedia;
