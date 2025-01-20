const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { ServiceDetails, Service, Industry, ServiceFaq, Technology } = require("../models/index.js");

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

    // Verify service exists and log the result
    const existingService = await Service.findByPk(service_id);
    if (existingService) {
    }

    if (!existingService) {
      // Log all services to verify the data
      const allServices = await Service.findAll({
        attributes: ["id", "title"],
      });
      console.log("Available services:", allServices);

      return responseGenerator(
        res,
        "Service not found",
        statusCodeVars.NOT_FOUND || 404, // Provide fallback
        {
          tried_service_id: service_id,
          available_services: allServices.map((s) => s.id),
        }
      );
    }

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
    });

    return responseGenerator(
      res,
      vars.SERVICE_DETAILS_CREATE || "Service detail created successfully",
      statusCodeVars.CREATED || 201, // Changed to CREATED status
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
        },
      ],
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

    // Parse JSON strings
    serviceDetails = serviceDetails.map(detail => ({
      ...detail.toJSON(),
      stepsWeFollow: JSON.parse(detail.stepsWeFollow),
      serviceSolution: JSON.parse(detail.serviceSolution),
      techWeUse: JSON.parse(detail.techWeUse),
    }));

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

    // Parse JSON strings
    serviceDetail.stepsWeFollow = JSON.parse(serviceDetail.stepsWeFollow);
    serviceDetail.serviceSolution = JSON.parse(serviceDetail.serviceSolution);
    serviceDetail.techWeUse = JSON.parse(serviceDetail.techWeUse);

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
            model: ServiceFaq
          }]
        },
      ],
    });

    dataNotExist(
      serviceDetail,
      vars.SERVICE_DETAILS_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    // Parse JSON strings
    serviceDetail.stepsWeFollow = JSON.parse(serviceDetail.stepsWeFollow);
    serviceDetail.serviceSolution = JSON.parse(serviceDetail.serviceSolution);
    serviceDetail.techWeUse = JSON.parse(serviceDetail.techWeUse);

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
