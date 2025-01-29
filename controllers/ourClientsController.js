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
const { Op, sequelize } = require('sequelize');

exports.createOurClient = async (req, res, next) => {
  try {
    const { title, image, alt } = req.body;
    
    // Get the highest index
    const maxIndex = await OurClient.max('index') || 0;
    
    const newOurClient = await OurClient.create({
      title,
      image,
      alt,
      index: maxIndex + 1  // Set the new index as highest + 1
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
        order: [["index", "ASC"]],  // Order by index ascending
      });
    } else {
      // Handle pagination
      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;

      const { rows, count: totalItems } = await OurClient.findAndCountAll({
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
        order: [["index", "ASC"]],  // Order by index ascending
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
      },
      order: [["index", "ASC"]]  // Order by index ascending
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

// New function to reorder clients
exports.reorderClients = async (req, res, next) => {
  try {
    const { firstClientId, secondClientId } = req.body;

    // Find both clients
    const firstClient = await OurClient.findByPk(firstClientId);
    const secondClient = await OurClient.findByPk(secondClientId);

    if (!firstClient || !secondClient) {
      return responseGenerator(
        res,
        'One or both clients not found',
        statusCodeVars.NOT_FOUND
      );
    }

    // Store the original indices
    const firstIndex = firstClient.index;
    const secondIndex = secondClient.index;

    // Use OurClient.sequelize instead of direct sequelize reference
    await OurClient.sequelize.transaction(async (t) => {
      await firstClient.update({ index: secondIndex }, { transaction: t });
      await secondClient.update({ index: firstIndex }, { transaction: t });
    });

    const updatedClients = await OurClient.findAll({
      order: [['index', 'ASC']]
    });

    return responseGenerator(
      res,
      'Clients reordered successfully',
      statusCodeVars.OK,
      updatedClients
    );
  } catch (err) {
    next(err);
  }
};
