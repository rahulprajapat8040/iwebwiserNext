const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const {
  setCacheData,
  getCacheData,
  deleteCacheData,
} = require("../helper/redis.helper.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { Technology, SubServices } = require("../models/index.js");
const { Op, sequelize } = require('sequelize');

exports.createTechnology = async (req, res, next) => {
  try {
    const { title, image, alt } = req.body;
    
    // Get the highest index
    const maxIndex = await Technology.max('index') || 0;
    
    const newTechnology = await Technology.create({
      title,
      image,
      alt,
      index: maxIndex + 1  // Set the new index as highest + 1
    });

    return responseGenerator(
      res,
      vars.TECHNOLOGY_CREATE,
      statusCodeVars.OK,
      newTechnology
    );
  } catch (err) {
    next(err);
  }
};

exports.updateTechnology = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, image, alt } = req.body;

    const technology = await Technology.findByPk(id);
    dataNotExist(
      technology,
      vars.TECHNOLOGY_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    const updatedTechnology = await technology.update({
      title,
      image,
      alt,
    });

    return responseGenerator(
      res,
      vars.TECHNOLOGY_UPDATE,
      statusCodeVars.OK,
      updatedTechnology
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllTechnology = async (req, res, next) => {
  try {
    const { page, limit, showAll } = req.query;

    let technologys;
    let pageInfo = null;

    if (showAll === "true") {
      technologys = await Technology.findAll({
        order: [["index", "ASC"]],  // Order by index ascending
      });
    } else {
      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;

      const { rows, count: totalItems } = await Technology.findAndCountAll({
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
        order: [["index", "ASC"]],  // Order by index ascending
      });

      technologys = rows;
      const totalPages = Math.ceil(totalItems / pageSize);

      pageInfo = {
        currentPage: pageNumber,
        totalPages,
        totalItems,
      };
    }

    return responseGenerator(res, vars.TECHNOLOGY_GET, statusCodeVars.OK, {
      technologys,
      pageInfo,
    });
  } catch (err) {
    next(err);
  }
};

exports.getActiveTechnology = async (req, res, next) => {
  try {
    const technologies = await Technology.findAll({
      where: { active: true },
      order: [["index", "ASC"]],  // Order by index ascending
    });
    return responseGenerator(
      res,
      vars.TECHNOLOGY_GET,
      statusCodeVars.OK,
      technologies
    );
  } catch (err) {
    next(err);
  }
};

exports.getTechnologyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const technology = await Technology.findByPk(id);
    dataNotExist(
      technology,
      vars.TECHNOLOGY_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    return responseGenerator(
      res,
      vars.TECHNOLOGY_GET,
      statusCodeVars.OK,
      technology
    );
  } catch (err) {
    next(err);
  }
};

exports.deleteTechnology = async (req, res, next) => {
  try {
    const { id } = req.params;

    const technology = await Technology.findByPk(id);
    dataNotExist(
      technology,
      vars.TECHNOLOGY_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    await technology.destroy();
    return responseGenerator(
      res,
      vars.TECHNOLOGY_DELETE,
      statusCodeVars.OK,
      technology
    );
  } catch (err) {
    next(err);
  }
};

exports.searchTechnology = async (req, res) => {
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

    const results = await Technology.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } }
        ]
      },
      order: [["index", "ASC"]]  // Order by index ascending
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Technologies fetched successfully",
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

// New function to reorder technologies
exports.reorderTechnologies = async (req, res, next) => {
  try {
    const { firstTechnologyId, secondTechnologyId } = req.body;

    // Find both technologies
    const firstTechnology = await Technology.findByPk(firstTechnologyId);
    const secondTechnology = await Technology.findByPk(secondTechnologyId);

    if (!firstTechnology || !secondTechnology) {
      return responseGenerator(
        res,
        'One or both technologies not found',
        statusCodeVars.NOT_FOUND
      );
    }

    // Store the original indices
    const firstIndex = firstTechnology.index;
    const secondIndex = secondTechnology.index;

    // Use Technology.sequelize instead of direct sequelize reference
    await Technology.sequelize.transaction(async (t) => {
      await firstTechnology.update({ index: secondIndex }, { transaction: t });
      await secondTechnology.update({ index: firstIndex }, { transaction: t });
    });

    const updatedTechnologies = await Technology.findAll({
      order: [['index', 'ASC']]
    });

    return responseGenerator(
      res,
      'Technologies reordered successfully',
      statusCodeVars.OK,
      updatedTechnologies
    );
  } catch (err) {
    next(err);
  }
};
