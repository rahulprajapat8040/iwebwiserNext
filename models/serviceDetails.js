const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ServiceDetails = sequelize.define(
  "service_details",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    service_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "services",
        key: "id",
      },
    },
    hero_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hero_description: {
      type: DataTypes.TEXT("long"),
    },
    heroButtonText: {
      type: DataTypes.STRING,
    },
    heroButtonLink: {
      type: DataTypes.STRING,
    },
    ServiceDetailTitle: {
      type: DataTypes.STRING,
    },
    ServiceDetailSubTitle: {
      type: DataTypes.STRING,
    },
    ServiceDetailDescription: {
      type: DataTypes.TEXT("long"),
    },
    ServiceDetailButtonText: {
      type: DataTypes.STRING,
    },
    ServiceDetailButtonUrl: {
      type: DataTypes.STRING,
    },
    serviceIndustryTitle: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    serviceIndustryDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    serviceToolTitle: {
      type: DataTypes.TEXT,
    },
    serviceToolDescription: {
      type: DataTypes.TEXT("long"),
    },
    stepsWeFollow: {
      type: DataTypes.JSON,
    },
    serviceSolution: {
      type: DataTypes.JSON,
    },
    techWeUse: {
      type: DataTypes.JSON,
    },
    metas: {
      type: DataTypes.TEXT('long'),
      validate: {
        len: [0, 1000000000] // Adjusted validation rule to allow longer text
      }
    }
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

module.exports = ServiceDetails;
