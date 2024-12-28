const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SocialMedia = sequelize.define(
  "socialMedia",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    link: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.ENUM({
        values: ["facebook", "twitter", "instagram", "linkedin", "youtube"],
      }),
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

module.exports = SocialMedia;
