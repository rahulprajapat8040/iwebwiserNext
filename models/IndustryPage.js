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
      unique: true,
      allowNull: false,
    },
    industry_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // Add this to ensure one-to-one relationship
    },
    sub_service_ids: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
      get() {
        const rawValue = this.getDataValue("sub_service_ids");
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue("sub_service_ids", JSON.stringify(value || []));
      },
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
    }
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

module.exports = IndustryPage
