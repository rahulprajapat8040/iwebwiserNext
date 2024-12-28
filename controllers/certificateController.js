const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const {
  setCacheData,
  getCacheData,
  deleteCacheData,
} = require("../helper/redis.helper.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { Certificate } = require("../models/index.js");
const { Op } = require('sequelize');

exports.createCertificate = async (req, res, next) => {
  try {
    const { title, image } = req.body;
    const newCertificate = await Certificate.create({
      title,
      image,
    });
    return responseGenerator(
      res,
      vars.CERTIFICATE_CREATE,
      statusCodeVars.OK,
      newCertificate
    );
  } catch (err) {
    next(err);
  }
};

exports.updateCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, image } = req.body;

    const certificate = await Certificate.findByPk(id);
    dataNotExist(
      certificate,
      vars.CERTIFICATE_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    const updatedCertificate = await certificate.update({
      title,
      image,
    });
    return responseGenerator(
      res,
      vars.CERTIFICATE_UPDATAE,
      statusCodeVars.OK,
      updatedCertificate
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllCertificate = async (req, res, next) => {
  try {
    const { page, limit, showAll } = req.query;

    let certificates;
    let pageInfo = null;

    if (showAll === "true") {
      // Fetch all certificates without pagination
      certificates = await Certificate.findAll({
        order: [["createdAt", "ASC"]],
      });
    } else {
      // Handle pagination
      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;

      const { rows, count: totalItems } = await Certificate.findAndCountAll({
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
        order: [["createdAt", "ASC"]],
      });

      certificates = rows;
      const totalPages = Math.ceil(totalItems / pageSize);

      pageInfo = {
        currentPage: pageNumber,
        totalPages,
        totalItems,
      };
    }

    return responseGenerator(res, vars.CERTIFICATE_GET, statusCodeVars.OK, {
      certificates,
      pageInfo, // Include pagination data within the same object
    });
  } catch (err) {
    next(err);
  }
};

exports.getCertificateById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findByPk(id);
    dataNotExist(
      certificate,
      vars.CERTIFICATE_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    return responseGenerator(
      res,
      vars.CERTIFICATE_GET,
      statusCodeVars.OK,
      certificate
    );
  } catch (err) {
    next(err);
  }
};

exports.deleteCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findByPk(id);
    dataNotExist(
      certificate,
      vars.CERTIFICATE_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );
    await certificate.destroy();
    return responseGenerator(
      res,
      vars.CERTIFICATE_DELETE,
      statusCodeVars.OK,
      certificate
    );
  } catch (err) {
    next(err);
  }
};

exports.searchCertificateByTitle = async (req, res) => {
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

    const results = await Certificate.findAll({
      where: {
        title: {
          [Op.like]: `%${query}%`
        }
      }
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Certificates fetched successfully",
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
