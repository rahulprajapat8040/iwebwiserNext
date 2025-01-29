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
const { Op, sequelize } = require('sequelize');

exports.createCertificate = async (req, res, next) => {
  try {
    const { title, image, alt } = req.body;
    
    // Get the highest index
    const maxIndex = await Certificate.max('index') || 0;
    
    const newCertificate = await Certificate.create({
      title,
      image,
      alt,
      index: maxIndex + 1  // Set the new index as highest + 1
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
    const { title, image, alt } = req.body;

    const certificate = await Certificate.findByPk(id);
    dataNotExist(
      certificate,
      vars.CERTIFICATE_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    const updatedCertificate = await certificate.update({
      title,
      image,
      alt,
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
        order: [["index", "ASC"]],  // Order by index ascending
      });
    } else {
      // Handle pagination
      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;

      const { rows, count: totalItems } = await Certificate.findAndCountAll({
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
        order: [["index", "ASC"]],  // Order by index ascending
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
      },
      order: [["index", "ASC"]]  // Order by index ascending
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

// New function to reorder certificates
exports.reorderCertificates = async (req, res, next) => {
  try {
    const { firstCertificateId, secondCertificateId } = req.body;

    // Find both certificates
    const firstCertificate = await Certificate.findByPk(firstCertificateId);
    const secondCertificate = await Certificate.findByPk(secondCertificateId);

    if (!firstCertificate || !secondCertificate) {
      return responseGenerator(
        res,
        'One or both certificates not found',
        statusCodeVars.NOT_FOUND
      );
    }

    // Store the original indices
    const firstIndex = firstCertificate.index;
    const secondIndex = secondCertificate.index;

    // Use Certificate.sequelize instead of direct sequelize reference
    await Certificate.sequelize.transaction(async (t) => {
      await firstCertificate.update({ index: secondIndex }, { transaction: t });
      await secondCertificate.update({ index: firstIndex }, { transaction: t });
    });

    const updatedCertificates = await Certificate.findAll({
      order: [['index', 'ASC']]
    });

    return responseGenerator(
      res,
      'Certificates reordered successfully',
      statusCodeVars.OK,
      updatedCertificates
    );
  } catch (err) {
    next(err);
  }
};
