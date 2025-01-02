const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ServiceDetailsSubServices = sequelize.define("service_details_sub_services", {
  service_detail_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: {
      model: "service_details",
      key: "id",
    },
  },
  sub_service_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: {
      model: "sub_services",
      key: "id",
    },
  },
}, {
  timestamps: true,
});

module.exports = ServiceDetailsSubServices;
