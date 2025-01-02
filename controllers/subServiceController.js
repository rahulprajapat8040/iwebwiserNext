const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const {
  setCacheData,
  getCacheData,
  deleteCacheData,
} = require("../helper/redis.helper.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { SubServices, Service } = require("../models/index.js");
const { Op } = require("sequelize");

exports.createSubService = async (req, res, next) => {
  try {
    const { service_id, title, description, image, button_link } = req.body;
    const newSubService = await SubServices.create({
      service_id,
      title,
      description,
      image,
      button_link,
    });
    return responseGenerator(
      res,
      vars.SUB_SERVICE_CREATE,
      statusCodeVars.OK,
      newSubService
    );
  } catch (err) {
    next(err);
  }
};

exports.updateSubService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { service_id, title, description, image, button_link } = req.body;

    const subService = await SubServices.findByPk(id);
    dataNotExist(
      subService,
      vars.SUB_SERVICE_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    const updatedSubService = await subService.update({
      service_id,
      title,
      description,
      image,
      button_link,
    });
    return responseGenerator(
      res,
      vars.SUB_SERVICE_UPDATE,
      statusCodeVars.OK,
      updatedSubService
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllSubServices = async (req, res, next) => {
  try {
    const { page, limit, showAll } = req.query;

    let subServices;
    let pageInfo = null;

    if (showAll === "true") {
      subServices = await SubServices.findAll();
    } else {
      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;

      const { rows, count: totalItems } = await SubServices.findAndCountAll({
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
        include: [
          {
            model: Service,
            attributes: ["id", "title"],
          },
        ],
      });

      subServices = rows;
      const totalPages = Math.ceil(totalItems / pageSize);

      pageInfo = {
        currentPage: pageNumber,
        totalPages,
        totalItems,
      };
    }

    return responseGenerator(res, vars.SUB_SERVICE_GET, statusCodeVars.OK, {
      subServices,
      pageInfo,
    });
  } catch (err) {
    next(err);
  }
};

exports.getSubServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subService = await SubServices.findByPk(id);
    dataNotExist(
      subService,
      vars.SUB_SERVICE_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    return responseGenerator(
      res,
      vars.SUB_SERVICE_GET,
      statusCodeVars.OK,
      subService
    );
  } catch (err) {
    next(err);
  }
};

exports.getSubServiceByServiceId = async (req, res, next) => {
  try {
    const { service_id } = req.params;
    const subServices = await SubServices.findAll({
      where: {
        service_id,
      },
      include: [
        {
          model: Service,
          attributes: ["id", "title"],
        },
      ],
    });

    return responseGenerator(
      res,
      vars.SUB_SERVICE_GET,
      statusCodeVars.OK,
      subServices
    );
  } catch (err) {
    next(err);
  }
};

exports.deleteSubService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subService = await SubServices.findByPk(id);
    dataNotExist(
      subService,
      vars.SUB_SERVICE_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );
    await subService.destroy();
    return responseGenerator(
      res,
      vars.SUB_SERVICE_DELETE,
      statusCodeVars.OK,
      subService
    );
  } catch (err) {
    next(err);
  }
};

exports.searchSubServiceByTitle = async (req, res) => {
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

    const results = await SubServices.findAll({
      where: {
        title: {
          [Op.like]: `%${query}%`,
        },
      },
      include: [
        {
          model: Service,
          attributes: ["id", "title"],
        },
      ],
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "SubServices fetched successfully",
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
