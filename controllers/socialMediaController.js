const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const {
  setCacheData,
  getCacheData,
  deleteCacheData,
} = require("../helper/redis.helper.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { SocialMedia, User } = require("../models/index.js");
const { Op } = require('sequelize');

const validSocialMediaTypes = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'];

exports.getAllSocialMedia = async (req, res, next) => {
  try {
    const socialData = await SocialMedia.findAll();
    return responseGenerator(res, vars.SOCIAL_MEDIA_GET, statusCodeVars.OK, {
      socialData
    });
  } catch (error) {
    next(error);
  }
};

exports.getActiveSocialMedia = async (req, res, next) => {
  try {
    const socialData = await SocialMedia.findAll({
      where: { active: true },
      order: [["createdAt", "ASC"]],
    });
    responseGenerator(
      res,
      vars.SOCIAL_MEDIA_GET,
      statusCodeVars.OK,
      socialData
    );
  } catch (error) {
    next(error);
  }
};

//id send by user for body
exports.updateSocialMedia = async (req, res, next) => {
  try {
    const { link, active, id, type } = req.body;

    // Validate social media type
    if (type && !validSocialMediaTypes.includes(type)) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: `Invalid social media type. Must be one of: ${validSocialMediaTypes.join(', ')}`,
        data: null
      });
    }

    let socialMedia = await SocialMedia.findByPk(id);

    if (socialMedia) {
      await socialMedia.update({ link, active });
    } else {
      socialMedia = await SocialMedia.create({ link, active, type });
    }

    return responseGenerator(
      res,
      vars.SOCIAL_MEDIA_UPDATAE,
      statusCodeVars.OK,
      socialMedia
    );
  } catch (err) {
    // Check for Sequelize validation errors
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeDatabaseError') {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Invalid social media type",
        error: err.message
      });
    }
    next(err);
  }
};

exports.getSocialMediaById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const socialMedia = await SocialMedia.findByPk(id);
    dataNotExist(
      socialMedia,
      vars.SOCIAL_MEDIA_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    return responseGenerator(
      res,
      vars.SOCIAL_MEDIA_GET,
      statusCodeVars.OK,
      socialMedia
    );
  } catch (err) {
    next(err);
  }
};

exports.deleteSocialMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const socialMedia = await SocialMedia.findByPk(id);
    dataNotExist(
      socialMedia,
      vars.SOCIAL_MEDIA_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );
    await socialMedia.destroy();
    return responseGenerator(
      res,
      vars.SOCIAL_MEDIA_DELETE,
      statusCodeVars.OK,
      socialMedia
    );
  } catch (err) {
    next(err);
  }
};

exports.searchSocialMedia = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Search query is required",
        data: []
      });
    }

    const searchConditions = {
      [Op.or]: [
        { type: { [Op.like]: `%${query}%` } },
        { link: { [Op.like]: `%${query}%` } }
      ]
    };

    const results = await SocialMedia.findAll({
      where: searchConditions
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Social media entries fetched successfully",
      data: results
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
