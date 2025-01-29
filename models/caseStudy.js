const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CaseStudy = sequelize.define(
  "caseStudy",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addCaseStudy: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    userCertificate: {
      type: DataTypes.JSON,
    },
    challenges: {
      type: DataTypes.JSON,
    },
    impact: {
      type: DataTypes.JSON,
    },
    system_phase: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    addtional_information: {
      type: DataTypes.JSON,
    },
    metas: {
      type: DataTypes.TEXT, 
      validate: {
        len: [0, 1000000000]
      }
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

module.exports = CaseStudy;
