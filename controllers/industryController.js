const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const {
  setCacheData,
  getCacheData,
  deleteCacheData,
} = require("../helper/redis.helper.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { Industry, Service, IndustryPage } = require("../models/index.js");
const { Op, sequelize } = require("sequelize");

exports.createIndustry = async (req, res, next) => {
  try {
    const { title, description, button_link, image, alt, icon, iconAlt } = req.body;

    // Get the highest index
    const maxIndex = await Industry.max('index') || 0;

    const newIndustry = await Industry.create({
      title,
      description,
      button_link,
      image,
      alt,
      icon,
      iconAlt,
      index: maxIndex + 1  // Set the new index as highest + 1
    });
    return responseGenerator(
      res,
      vars.INDUSTRY_CREATE,
      statusCodeVars.OK,
      newIndustry
    );
  } catch (err) {
    next(err);
  }
};

exports.updateIndustry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, button_link, image, alt, icon, iconAlt } = req.body;

    const industry = await Industry.findByPk(id);
    dataNotExist(industry, vars.INDUSTRY_NOT_FOUND, statusCodeVars.NOT_FOUND);

    const updatedIndustry = await industry.update({
      title,
      description,
      icon,
      iconAlt,
      button_link,
      image,
      alt,
    });
    return responseGenerator(
      res,
      vars.INDUSTRY_UPDATAE,
      statusCodeVars.OK,
      updatedIndustry
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllIndustry = async (req, res, next) => {
  try {
    const { page, limit, showAll } = req.query;

    let industryData;
    let pageInfo = null;

    if (showAll === "true") {
      // Fetch all industry data without pagination
      industryData = await Industry.findAll({
        order: [["index", "ASC"]],  // Order by index ascending
        include: [
          {
            model: IndustryPage,
            attributes: ['slug']
          }
        ]
      });
    } else {
      // Handle pagination
      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;

      const { rows, count: totalItems } = await Industry.findAndCountAll({
        order: [["index", "ASC"]],  // Order by index ascending
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
      });

      industryData = rows;
      const totalPages = Math.ceil(totalItems / pageSize);

      pageInfo = {
        currentPage: pageNumber,
        totalPages,
        totalItems,
      };
    }

    return responseGenerator(res, vars.INDUSTRY_GET, statusCodeVars.OK, {
      industryData,
      pageInfo, // Include pagination data within the same object
    });
  } catch (err) {
    next(err);
  }
};

exports.getIndustryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const industry = await Industry.findByPk(id);
    dataNotExist(industry, vars.INDUSTRY_NOT_FOUND, statusCodeVars.NOT_FOUND);

    return responseGenerator(
      res,
      vars.INDUSTRY_GET,
      statusCodeVars.OK,
      industry
    );
  } catch (err) {
    next(err);
  }
};

exports.deleteIndustry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const industry = await Industry.findByPk(id);
    dataNotExist(industry, vars.INDUSTRY_NOT_FOUND, statusCodeVars.NOT_FOUND);
    await industry.destroy();
    return responseGenerator(
      res,
      vars.INDUSTRY_DELETE,
      statusCodeVars.OK,
      industry
    );
  } catch (err) {
    next(err);
  }
};

exports.searchIndustryByTitle = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Search query is required",
        data: [],
      });
    }

    const results = await Industry.findAll({
      where: {
        title: {
          [Op.like]: `%${query}%`,
        },
      },
      order: [["index", "ASC"]]  // Order by index ascending
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Industries fetched successfully",
      data: results,
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// New function to reorder industries
exports.reorderIndustries = async (req, res, next) => {
  try {
    const { firstIndustryId, secondIndustryId } = req.body;

    // Find both industries
    const firstIndustry = await Industry.findByPk(firstIndustryId);
    const secondIndustry = await Industry.findByPk(secondIndustryId);

    if (!firstIndustry || !secondIndustry) {
      return responseGenerator(
        res,
        'One or both industries not found',
        statusCodeVars.NOT_FOUND
      );
    }

    // Store the original indices
    const firstIndex = firstIndustry.index;
    const secondIndex = secondIndustry.index;

    // Use Industry.sequelize instead of direct sequelize reference
    await Industry.sequelize.transaction(async (t) => {
      await firstIndustry.update({ index: secondIndex }, { transaction: t });
      await secondIndustry.update({ index: firstIndex }, { transaction: t });
    });

    const updatedIndustries = await Industry.findAll({
      order: [['index', 'ASC']]
    });

    return responseGenerator(
      res,
      'Industries reordered successfully',
      statusCodeVars.OK,
      updatedIndustries
    );
  } catch (err) {
    next(err);
  }
};
