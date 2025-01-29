const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ServiceFaq = sequelize.define(
  "service_faq",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    service_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "services", // Correct table name
        key: "id",
      },
    },
    question: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
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

module.exports = ServiceFaq;