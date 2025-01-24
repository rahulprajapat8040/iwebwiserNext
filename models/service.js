const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Service = sequelize.define("services", {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
  },
  short_description: {
    type: DataTypes.TEXT("long"),
  },
  long_description: {
    type: DataTypes.TEXT("long"),
  },
  button_link: {
    type: DataTypes.STRING,
  },
  image: {
    type: DataTypes.STRING,
  },
  alt: {
    type: DataTypes.STRING
  },
  field_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'fields',
      key: 'id'
    }
  },
  index: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  hideService: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  paranoid: true,
});

module.exports = Service;
