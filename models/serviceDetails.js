const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ServiceDetails = sequelize.define("service_details", {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
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
  sub_service_ids: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('sub_service_ids');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('sub_service_ids', JSON.stringify(value || []));
    }
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
    type: DataTypes.STRING,
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
}, {
  timestamps: true,
  paranoid: true,
});

module.exports = ServiceDetails;
