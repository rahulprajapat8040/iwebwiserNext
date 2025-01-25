const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");

const {
  setCacheData,
  getCacheData,
  deleteCacheData,
} = require("../helper/redis.helper.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { Op } = require("sequelize");
const { Service, SubServices, ServiceFaq, Field, ServiceDetails } = require("../models/index.js");

exports.createService = async (req, res, next) => {
  try {
    const { title, short_description, long_description, button_link, image, field_id, alt } = req.body;

    // Get the highest index
    const maxIndex = await Service.max('index') || 0;

    const newService = await Service.create({
      title,
      short_description,
      long_description,
      button_link,
      image,
      field_id,
      alt,
      index: maxIndex + 1  // Set the new index as highest + 1
    });

    return responseGenerator(res, vars.SERVICE_CREATE, statusCodeVars.OK, newService);
  } catch (err) {
    next(err);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, short_description, long_description, button_link, image, field_id, alt, hideService } =
      req.body;

    const service = await Service.findByPk(id);
    dataNotExist(service, vars.SERVICE_NOT_FOUND, statusCodeVars.NOT_FOUND);

    const updatedService = await service.update({
      title,
      short_description,
      long_description,
      button_link,
      image,
      field_id,
      hideService,
      alt,
    });
    return responseGenerator(
      res,
      vars.SERVICE_UPDATAE,
      statusCodeVars.OK,
      updatedService
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllService = async (req, res, next) => {
  try {
    const { page, limit, showAll } = req.query;

    let services;
    let pageInfo = null;

    if (showAll === "true") {
      services = await Service.findAll({
        order: [["index", "ASC"]], // Changed from createdAt to index
        include: [
          {
            model: SubServices,
          },
          {
            model: ServiceFaq,
            attributes: ["id", "question", "answer"],
          },
          {
            model: Field,
            attributes: ["id", "title", "description"],
          },
          {
            model: ServiceDetails,
            attributes: ["slug"]
          }
        ],
      });
    } else {
      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;

      const { rows, count: totalItems } = await Service.findAndCountAll({
        order: [["index", "ASC"]], // Changed from createdAt to index
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
        include: [
          {
            model: SubServices,
          },
          {
            model: Field,
            attributes: ["id", "title", "description"],
          }
        ],
      });

      services = rows;
      const totalPages = Math.ceil(totalItems / pageSize);

      pageInfo = {
        currentPage: pageNumber,
        totalPages,
        totalItems,
      };
    }

    return responseGenerator(res, vars.SERVICE_GET, statusCodeVars.OK, {
      services,
      pageInfo, // Include pagination data within the same object
    });
  } catch (err) {
    next(err);
  }
};

exports.getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);
    dataNotExist(service, vars.SERVICE_NOT_FOUND, statusCodeVars.NOT_FOUND);

    return responseGenerator(res, vars.SERVICE_GET, statusCodeVars.OK, service);
  } catch (err) {
    next(err);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);
    dataNotExist(service, vars.SERVICE_NOT_FOUND, statusCodeVars.NOT_FOUND);
    await service.destroy();
    return responseGenerator(
      res,
      vars.SERVICE_DELETE,
      statusCodeVars.OK,
      service
    );
  } catch (err) {
    next(err);
  }
};

exports.searchServiceByTitle = async (req, res) => {
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

    const results = await Service.findAll({
      where: {
        title: {
          [Op.like]: `%${query}%`,
        },
      },
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Services fetched successfully",
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

// Add this new method for reordering
exports.reorderServices = async (req, res, next) => {
  try {
    const { firstServiceId, secondServiceId } = req.body;

    // Find both services
    const firstService = await Service.findByPk(firstServiceId);
    const secondService = await Service.findByPk(secondServiceId);

    if (!firstService || !secondService) {
      return responseGenerator(
        res,
        'One or both services not found',
        statusCodeVars.NOT_FOUND
      );
    }

    // Store the original indices
    const firstIndex = firstService.index;
    const secondIndex = secondService.index;

    // Use Service.sequelize instead of direct sequelize reference
    await Service.sequelize.transaction(async (t) => {
      await firstService.update({ index: secondIndex }, { transaction: t });
      await secondService.update({ index: firstIndex }, { transaction: t });
    });

    const updatedServices = await Service.findAll({
      order: [['index', 'ASC']]
    });

    return responseGenerator(
      res,
      'Services reordered successfully',
      statusCodeVars.OK,
      updatedServices
    );
  } catch (err) {
    next(err);
  }
};
