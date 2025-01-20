const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const {
  setCacheData,
  getCacheData,
  deleteCacheData,
} = require("../helper/redis.helper.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { OurClient } = require("../models/index.js");
const { Op } = require('sequelize');

exports.createOurClient = async (req, res, next) => {
  try {
    const { title, image, alt } = req.body;
    const newOurClient = await OurClient.create({
      title,
      image,
      alt,
    });
    return responseGenerator(
      res,
      vars.OUR_CLIENTS_CREATE,
      statusCodeVars.OK,
      newOurClient
    );
  } catch (err) {
    next(err);
  }
};

exports.updateOurClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, image, alt } = req.body;

    const ourClient = await OurClient.findByPk(id);
    dataNotExist(
      ourClient,
      vars.OUR_CLIENTS_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    const updatedOurClient = await ourClient.update({
      title,
      image,
      alt,
    });
    return responseGenerator(
      res,
      vars.OUR_CLIENTS_UPDATAE,
      statusCodeVars.OK,
      updatedOurClient
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllOurClient = async (req, res, next) => {
  try {
    const { page, limit, showAll } = req.query;

    let ourClients;
    let pageInfo = null;

    if (showAll === "true") {
      // Fetch all client data without pagination
      ourClients = await OurClient.findAll({
        order: [["createdAt", "ASC"]],
      });
    } else {
      // Handle pagination
      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;

      const { rows, count: totalItems } = await OurClient.findAndCountAll({
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
        order: [["createdAt", "ASC"]],
      });

      ourClients = rows;
      const totalPages = Math.ceil(totalItems / pageSize);

      pageInfo = {
        currentPage: pageNumber,
        totalPages,
        totalItems,
      };
    }

    return responseGenerator(res, vars.OUR_CLIENTS_GET, statusCodeVars.OK, {
      ourClients,
      pageInfo, // Include pagination data within the same object
    });
  } catch (err) {
    next(err);
  }
};

exports.getOurClientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ourClient = await OurClient.findByPk(id);
    dataNotExist(
      ourClient,
      vars.OUR_CLIENTS_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    return responseGenerator(
      res,
      vars.OUR_CLIENTS_GET,
      statusCodeVars.OK,
      ourClient
    );
  } catch (err) {
    next(err);
  }
};

exports.deleteOurClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ourClient = await OurClient.findByPk(id);
    dataNotExist(
      ourClient,
      vars.OUR_CLIENTS_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );
    await ourClient.destroy();
    return responseGenerator(
      res,
      vars.OUR_CLIENTS_DELETE,
      statusCodeVars.OK,
      ourClient
    );
  } catch (err) {
    next(err);
  }
};

exports.searchOurClientByTitle = async (req, res) => {
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

    const results = await OurClient.findAll({
      where: {
        title: {
          [Op.like]: `%${query}%`
        }
      }
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Clients fetched successfully",
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
