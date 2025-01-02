const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { ServiceDetails, Service, SubServices } = require("../models/index.js");

exports.createServiceDetail = async (req, res, next) => {
  try {
    const {
      service_id,
      sub_service_ids, // Changed from subServiceIds to sub_service_ids
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

    if (existingService) {
      return responseGenerator(
        res,
        "Service detail already exists for this service",
        statusCodeVars.CONFLICT || 409,
        {
          existing_service_detail_id: existingService.id,
          service_id,
        }
      );
    }

    // Ensure sub_service_ids is stored as JSON
    const parsedSubServiceIds = Array.isArray(sub_service_ids)
      ? sub_service_ids
      : [];

    const newServiceDetail = await ServiceDetails.create({
      service_id,
      sub_service_ids: parsedSubServiceIds, // Changed from subServiceIds to sub_service_ids
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

    // If you need sub-services data, fetch it separately
    if (serviceDetails) {
      const subServicesMap = await SubServices.findAll({
        where: {
          id: serviceDetails.flatMap((detail) => detail.sub_service_ids),
        },
      }).then((services) =>
        services.reduce((acc, service) => {
          acc[service.id] = service;
          return acc;
        }, {})
      );

      serviceDetails = serviceDetails.map((detail) => ({
        ...detail.get(),
        sub_services: detail.sub_service_ids
          .map((id) => subServicesMap[id])
          .filter(Boolean),
      }));
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

    if (serviceDetail && serviceDetail.sub_service_ids?.length > 0) {
      const subServices = await SubServices.findAll({
        where: {
          id: serviceDetail.sub_service_ids,
        },
      });
      serviceDetail.setDataValue("sub_services", subServices);
    }

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

exports.getServiceDetailByServiceId = async (req, res, next) => {
  try {
    const { service_id } = req.params;
    const serviceDetail = await ServiceDetails.findOne({
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

    if (serviceDetail && serviceDetail.sub_service_ids?.length > 0) {
      const subServices = await SubServices.findAll({
        where: {
          id: serviceDetail.sub_service_ids,
        },
      });
      serviceDetail.setDataValue("sub_services", subServices);
    }

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
