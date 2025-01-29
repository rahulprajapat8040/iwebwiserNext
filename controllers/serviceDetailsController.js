const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { ServiceDetails, Service, Industry, ServiceFaq, Technology, Field } = require("../models/index.js");
const { sequelize } = require("sequelize");

exports.createServiceDetail = async (req, res, next) => {
  try {
    const {
      service_id,
      hero_title,
      slug,
      hero_description,
      heroButtonText,
      heroButtonLink,
      ServiceDetailTitle,
      ServiceDetailSubTitle,
      ServiceDetailDescription,
      ServiceDetailButtonText,
      ServiceDetailButtonUrl,
      serviceIndustryTitle,
      serviceIndustryDescription,
      serviceToolTitle,
      serviceToolDescription,
      stepsWeFollow,
      serviceSolution,
      techWeUse,
      metas,
    } = req.body;

    // Get the highest index
    const maxIndex = await ServiceDetails.max('index') || 0;

    const newServiceDetail = await ServiceDetails.create({
      service_id,
      slug,
      hero_title,
      hero_description,
      heroButtonText,
      heroButtonLink,
      ServiceDetailTitle,
      ServiceDetailSubTitle,
      ServiceDetailDescription,
      ServiceDetailButtonText,
      ServiceDetailButtonUrl,
      serviceIndustryTitle,
      serviceIndustryDescription,
      serviceToolTitle,
      serviceToolDescription,
      stepsWeFollow,
      serviceSolution,
      techWeUse,
      metas,
      index: maxIndex + 1  // Set the new index as highest + 1
    });

    return responseGenerator(
      res,
      vars.SERVICE_DETAILS_CREATE || "Service detail created successfully",
      statusCodeVars.CREATED || 201,
      newServiceDetail
    );
  } catch (err) {
    console.error("Error creating service detail:", err);
    return responseGenerator(
      res,
      "Internal server error",
      statusCodeVars.INTERNAL_SERVER_ERROR || 500,
      null
    );
  }
};

exports.getAllServiceDetails = async (req, res, next) => {
  try {
    const { page, limit, showAll } = req.query;

    const includeOptions = {
      include: [
        {
          model: Service,
          include: [
            {
              model: Field
            }
          ]
        },
      ],
      order: [["index", "ASC"]]  // Order by index ascending
    };

    let serviceDetails;
    let pageInfo = null;

    if (showAll === "true") {
      serviceDetails = await ServiceDetails.findAll(includeOptions);
      
    } else {
      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;

      const { rows, count: totalItems } = await ServiceDetails.findAndCountAll({
        ...includeOptions,
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
      });

      serviceDetails = rows;
      const totalPages = Math.ceil(totalItems / pageSize);

      pageInfo = {
        currentPage: pageNumber,
        totalPages,
        totalItems,
      };
    }

    return responseGenerator(res, vars.SERVICE_DETAILS_GET, statusCodeVars.OK, {
      serviceDetails,
      pageInfo,
    });
  } catch (err) {
    next(err);
  }
};

exports.getServiceDetailById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const serviceDetail = await ServiceDetails.findByPk(id, {
      include: [
        {
          model: Service,
          attributes: ["id", "title"],
        },
      ],
    });

    dataNotExist(
      serviceDetail,
      vars.SERVICE_DETAILS_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    return responseGenerator(
      res,
      vars.SERVICE_DETAILS_GET,
      statusCodeVars.OK,
      serviceDetail
    );
  } catch (err) {
    next(err);
  }
};

exports.getServicedetailBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const serviceDetail = await ServiceDetails.findOne({
      where: {
        slug,
      },
      include: [
        {
          model: Service,
          attributes: ["id", "title"],
          include: [ {
            model: ServiceFaq,
            order: [["index", "ASC"]]  // Order FAQs by index
          }]
        },
      ],
      order: [["index", "ASC"]]  // Order by index ascending
    });

    dataNotExist(
      serviceDetail,
      vars.SERVICE_DETAILS_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    return responseGenerator(
      res,
      vars.SERVICE_DETAILS_GET,
      statusCodeVars.OK,
      serviceDetail
    );
  } catch (err) {
    next(err);
  }
};

exports.updateServiceDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const serviceDetail = await ServiceDetails.findByPk(id);
    dataNotExist(
      serviceDetail,
      vars.SERVICE_DETAILS_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    const updatedServiceDetail = await serviceDetail.update(req.body);
    return responseGenerator(
      res,
      vars.SERVICE_DETAILS_UPDATE,
      statusCodeVars.OK,
      updatedServiceDetail
    );
  } catch (err) {
    next(err);
  }
};

exports.deleteServiceDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const serviceDetail = await ServiceDetails.findByPk(id);
    dataNotExist(
      serviceDetail,
      vars.SERVICE_DETAILS_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    await serviceDetail.destroy();
    return responseGenerator(
      res,
      vars.SERVICE_DETAILS_DELETE,
      statusCodeVars.OK,
      serviceDetail
    );
  } catch (err) {
    next(err);
  }
};

// New function to reorder service details
exports.reorderServiceDetails = async (req, res, next) => {
  try {
    const { firstServiceDetailId, secondServiceDetailId } = req.body;

    // Find both service details
    const firstServiceDetail = await ServiceDetails.findByPk(firstServiceDetailId);
    const secondServiceDetail = await ServiceDetails.findByPk(secondServiceDetailId);

    if (!firstServiceDetail || !secondServiceDetail) {
      return responseGenerator(
        res,
        'One or both service details not found',
        statusCodeVars.NOT_FOUND
      );
    }

    // Store the original indices
    const firstIndex = firstServiceDetail.index;
    const secondIndex = secondServiceDetail.index;

    // Use ServiceDetails.sequelize instead of direct sequelize reference
    await ServiceDetails.sequelize.transaction(async (t) => {
      await firstServiceDetail.update({ index: secondIndex }, { transaction: t });
      await secondServiceDetail.update({ index: firstIndex }, { transaction: t });
    });

    const updatedServiceDetails = await ServiceDetails.findAll({
      order: [['index', 'ASC']]
    });

    return responseGenerator(
      res,
      'Service details reordered successfully',
      statusCodeVars.OK,
      updatedServiceDetails
    );
  } catch (err) {
    next(err);
  }
};
