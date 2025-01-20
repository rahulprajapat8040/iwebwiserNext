const sequelize = require("../config/db");
const { Sequelize, DataTypes } = require("sequelize");

const IndustryPage = sequelize.define(
  "industry_page",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING,
      // unique: true,
      allowNull: false,
    },
    industry_id: {
      type: DataTypes.UUID,
      allowNull: false,
      // Removed unique constraint
    },
    hero_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hero_description: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    industry_title:{
      type: DataTypes.STRING,
    },
    industry_description:{
      type: DataTypes.TEXT("long"),
    },
    industrySolution:{
      type: DataTypes.JSON,
    },
    metas: {
      type: DataTypes.TEXT, 
      validate: {
        len: [0, 1000000000]
      }
    }
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

module.exports = IndustryPage;
