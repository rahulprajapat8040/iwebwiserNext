const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SubServices = sequelize.define(
  "sub_services",
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT("long"),
      
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      // defaultValue: null,
    },
    button_link: {
      type: DataTypes.STRING,
      // defaultValue: null,
    },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

module.exports = SubServices;
