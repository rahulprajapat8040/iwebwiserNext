const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Branch = sequelize.define(
  "branche",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    zip_code: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    country: {
      type: DataTypes.STRING,
    },
    pageId: {
      type: DataTypes.STRING,
    },
    index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Branch;
