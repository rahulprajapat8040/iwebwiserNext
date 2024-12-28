const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const {
  setCacheData,
  getCacheData,
  deleteCacheData,
} = require("../helper/redis.helper.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { Technology } = require("../models/index.js");
const { Op } = require('sequelize');

exports.createTechnology = async (req, res, next) => {
  try {
    const { title, image } = req.body;
    const newTechnology = await Technology.create({
      title,
      image,
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
    const { title, image } = req.body;

    const technology = await Technology.findByPk(id);
    dataNotExist(
      technology,
      vars.TECHNOLOGY_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    const updatedTechnology = await technology.update({
      title,
      image,
    });
    return responseGenerator(
      res,
      vars.TECHNOLOGY_UPDATAE,
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
        // Fetch all technologies without pagination
        technologys = await Technology.findAll();
      } else {
        // Handle pagination
        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10;
  
        const { rows, count: totalItems } = await Technology.findAndCountAll({
          limit: pageSize,
          offset: (pageNumber - 1) * pageSize,
        });
  
        technologys = rows;
        const totalPages = Math.ceil(totalItems / pageSize);
  
        pageInfo = {
          currentPage: pageNumber,
          totalPages,
          totalItems,
        };
      }
  
      // Send both technologies and pagination info in a single object
      return responseGenerator(
        res,
        vars.TECHNOLOGY_GET,
        statusCodeVars.OK,
        {
          technologys,
          pageInfo,  // Include pagination data within the same object
        }
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

exports.searchTechnologyByTitle = async (req, res) => {
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
        title: {
          [Op.like]: `%${query}%`
        }
      }
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
