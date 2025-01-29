const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const {
  setCacheData,
  getCacheData,
  deleteCacheData,
} = require("../helper/redis.helper.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { SocialMedia } = require("../models/index.js");
const { Op, sequelize } = require('sequelize');


exports.createSocialMedia = async (req, res, next) => {
  try {
    const { link, type, active } = req.body;
    
    // Get the highest index
    const maxIndex = await SocialMedia.max('index') || 0;
    
    const newSocialMedia = await SocialMedia.create({
      link,
      active,
      index: maxIndex + 1  // Set the new index as highest + 1
    });
    return responseGenerator(
      res,
      vars.SOCIAL_MEDIA_CREATE,
      statusCodeVars.OK,
      newSocialMedia
    );
  } catch (err) {
    next(err);
  }
};

//id send by user for body
exports.updateSocialMedia = async (req, res, next) => {
  try {
    const { link, active, id, title, icon,} = req.body;
    const maxIndex = await SocialMedia.max('index') || 0;
    // Validate social media type

    let socialMedia = await SocialMedia.findByPk(id);

    if (socialMedia) {
      await socialMedia.update({ link, active, icon, title });
    } else {
      socialMedia = await SocialMedia.create({ link, active, index: maxIndex + 1, title , icon});
    }

    return responseGenerator(
      res,
      vars.SOCIAL_MEDIA_UPDATAE,
      statusCodeVars.OK,
      socialMedia
    );
  } catch (err) {
    next(err);
  }
};


exports.getAllSocialMedia = async (req, res, next) => {
  try {
    const { page, limit, showAll } = req.query;

    let socialData;
    let pageInfo = null;

    if (showAll === "true") {
      socialData = await SocialMedia.findAll({
        order: [["index", "ASC"]],  // Order by index ascending
      });
    } else {
      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;

      const { rows, count: totalItems } = await SocialMedia.findAndCountAll({
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
        order: [["index", "ASC"]],  // Order by index ascending
      });

      socialData = rows;
      const totalPages = Math.ceil(totalItems / pageSize);

      pageInfo = {
        currentPage: pageNumber,
        totalPages,
        totalItems,
      };
    }

    return responseGenerator(res, vars.SOCIAL_MEDIA_GET, statusCodeVars.OK, {
      socialData,
      pageInfo,
    });
  } catch (err) {
    next(err);
  }
};

exports.getActiveSocialMedia = async (req, res, next) => {
  try {
    const socialData = await SocialMedia.findAll({
      where: { active: true },
      order: [["index", "ASC"]],  // Order by index ascending
    });
    return responseGenerator(
      res,
      vars.SOCIAL_MEDIA_GET,
      statusCodeVars.OK,
      socialData
    );
  } catch (err) {
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

    const results = await SocialMedia.findAll({
      where: {
        [Op.or]: [
          { type: { [Op.like]: `%${query}%` } },
          { link: { [Op.like]: `%${query}%` } }
        ]
      },
      order: [["index", "ASC"]]  // Order by index ascending
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Social media links fetched successfully",
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

// New function to reorder social media links
exports.reorderSocialMedia = async (req, res, next) => {
  try {
    const { firstSocialMediaId, secondSocialMediaId } = req.body;

    // Find both social media items
    const firstSocialMedia = await SocialMedia.findByPk(firstSocialMediaId);
    const secondSocialMedia = await SocialMedia.findByPk(secondSocialMediaId);

    if (!firstSocialMedia || !secondSocialMedia) {
      return responseGenerator(
        res,
        'One or both social media items not found',
        statusCodeVars.NOT_FOUND
      );
    }

    // Store the original indices
    const firstIndex = firstSocialMedia.index;
    const secondIndex = secondSocialMedia.index;

    // Use SocialMedia.sequelize instead of direct sequelize reference
    await SocialMedia.sequelize.transaction(async (t) => {
      await firstSocialMedia.update({ index: secondIndex }, { transaction: t });
      await secondSocialMedia.update({ index: firstIndex }, { transaction: t });
    });

    const updatedSocialMedia = await SocialMedia.findAll({
      order: [['index', 'ASC']]
    });

    return responseGenerator(
      res,
      'Social media items reordered successfully',
      statusCodeVars.OK,
      updatedSocialMedia
    );
  } catch (err) {
    next(err);
  }
};
