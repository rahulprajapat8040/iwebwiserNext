const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const {
  IndustryPage,
  Industry,
  SubServices,
  Technology,
} = require("../models/index.js");

exports.createIndustryPage = async (req, res, next) => {
  try {
    const {
      industry_id,
      sub_service_ids,
      hero_title,
      slug,
      hero_description,
      industry_title,
      industry_description,
    } = req.body;

    // Ensure sub_service_ids is stored as JSON
    const parsedSubServiceIds = Array.isArray(sub_service_ids)
      ? sub_service_ids
      : [];

    const newIndustryPage = await IndustryPage.create({
      industry_id,
      sub_service_ids: parsedSubServiceIds,
      slug,
      hero_title,
      hero_description,
      industry_title,
      industry_description,
    });

    return responseGenerator(
      res,
      "Industry page created successfully",
      statusCodeVars.CREATED,
      newIndustryPage
    );
  } catch (err) {
    console.error("Error creating industry page:", err);
    return responseGenerator(
      res,
      "Internal server error",
      statusCodeVars.INTERNAL_SERVER_ERROR,
      null
    );
  }
};

exports.getAllIndustryPages = async (req, res, next) => {
  try {
    const includeOptions = {
      include: [
        {
          model: Industry,
          attributes: ["id", "title", "description", "image"],
        },
      ],
    };

    const industryPages = await IndustryPage.findAll(includeOptions);

    // Fetch sub-services data
    if (industryPages) {
      const subServicesMap = await SubServices.findAll({
        where: {
          id: industryPages.flatMap((page) => page.sub_service_ids),
        },
      }).then((services) =>
        services.reduce((acc, service) => {
          acc[service.id] = service;
          return acc;
        }, {})
      );

      const mappedIndustryPages = industryPages.map((page) => ({
        ...page.get(),
        sub_services: page.sub_service_ids
          .map((id) => subServicesMap[id])
          .filter(Boolean),
      }));

      return responseGenerator(
        res,
        "Industry pages retrieved",
        statusCodeVars.OK,
        {
          industryPages: mappedIndustryPages,
        }
      );
    }

    return responseGenerator(
      res,
      "Industry pages retrieved",
      statusCodeVars.OK,
      {
        industryPages: [],
      }
    );
  } catch (err) {
    next(err);
  }
};

exports.getIndustryPageBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const industryPage = await IndustryPage.findOne({
      where: { slug },
      include: [
        {
          model: Industry,
          attributes: ["id", "title", "description", "image"], // Updated attributes to match Industry model
        },
      ],
    });

    if (industryPage && industryPage.sub_service_ids?.length > 0) {
      const subServices = await SubServices.findAll({
        where: {
          id: industryPage.sub_service_ids,
        },
        include: [
          {
            model: Technology,
          },
        ],
      });
      industryPage.setDataValue("sub_services", subServices);
    }

    dataNotExist(
      industryPage,
      "Industry page not found",
      statusCodeVars.NOT_FOUND
    );

    return responseGenerator(
      res,
      "Industry page retrieved",
      statusCodeVars.OK,
      industryPage
    );
  } catch (err) {
    next(err);
  }
};

exports.getIndustryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const industry = await IndustryPage.findByPk(id);
    dataNotExist(industry, "Industry not found", statusCodeVars.NOT_FOUND);
    res.status(statusCodeVars.OK).json(industry);
  } catch (err) {
    next(err);
  }
};

exports.updateIndustryPage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const industryPage = await IndustryPage.findByPk(id);
    dataNotExist(
      industryPage,
      "Industry page not found",
      statusCodeVars.NOT_FOUND
    );

    const updatedIndustryPage = await industryPage.update(req.body);
    return responseGenerator(
      res,
      "Industry page updated",
      statusCodeVars.OK,
      updatedIndustryPage
    );
  } catch (err) {
    next(err);
  }
};

exports.deleteIndustryPage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const industryPage = await IndustryPage.findByPk(id);
    dataNotExist(
      industryPage,
      "Industry page not found",
      statusCodeVars.NOT_FOUND
    );

    await industryPage.destroy();
    return responseGenerator(
      res,
      "Industry page deleted",
      statusCodeVars.OK,
      industryPage
    );
  } catch (err) {
    next(err);
  }
};
