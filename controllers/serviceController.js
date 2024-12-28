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
const { Service, SubServices, ServiceFaq } = require("../models/index.js");

exports.createService = async (req, res, next) => {
  try {
    const { title, short_description, long_description, button_link, image } =
      req.body;
    const newService = await Service.create({
      title,
      short_description,
      long_description,
      button_link,
      image,
    });
    return responseGenerator(
      res,
      vars.SERVICE_CREATE,
      statusCodeVars.OK,
      newService
    );
  } catch (err) {
    next(err);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, short_description, long_description, button_link, image } =
      req.body;

    const service = await Service.findByPk(id);
    dataNotExist(service, vars.SERVICE_NOT_FOUND, statusCodeVars.NOT_FOUND);

    const updatedService = await service.update({
      title,
      short_description,
      long_description,
      button_link,
      image,
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
      // Fetch all services without pagination
      services = await Service.findAll({
        order: [["createdAt", "ASC"]],
        include: [
          {
            model: SubServices,
            attributes: ["id", "title", "description", "image", 'button_link'],
          },
          {
            model: ServiceFaq,
            attributes: ["id", "question", "answer"],
          },
        ],
      });
    } else {
      // Handle pagination
      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;

      const { rows, count: totalItems } = await Service.findAndCountAll({
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
        include: [
          {
            model: SubServices,
          },
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
