const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const {
  IndustryPage,
  Industry,
  CaseStudy,
} = require("../models/index.js");
const { sequelize } = require("sequelize");

exports.createIndustryPage = async (req, res, next) => {
  try {
    const {
      industry_id,
      hero_title,
      slug,
      hero_description,
      industry_title,
      heroBtnText,
      heroBtnLink,
      industry_description,
      industrySolution,
      metas,
    } = req.body;

    // Get the highest index
    const maxIndex = await IndustryPage.max('index') || 0;

    const newIndustryPage = await IndustryPage.create({
      industry_id,
      slug,
      hero_title,
      hero_description,
      industry_title,
      industry_description,
      industrySolution,
      heroBtnText,
      heroBtnLink,
      metas,
      index: maxIndex + 1  // Set the new index as highest + 1
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
          include: [{
            model: CaseStudy,
            as: 'caseStudies',
            order: [["index", "ASC"]]  // Order case studies by index
          }],
          attributes: ["id", "title", "description", "image"],
        },
      ],
      order: [["index", "ASC"]]  // Order by index ascending
    };

    const industryPages = await IndustryPage.findAll(includeOptions);

    const parsedIndustryPages = industryPages.map(page => ({
      ...page.get(),
      industrySolution: page.industrySolution
    }));

    return responseGenerator(
      res,
      "Industry pages retrieved",
      statusCodeVars.OK,
      {
        industryPages: parsedIndustryPages,
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
          include: [{
            model: CaseStudy,
            as: 'caseStudies',
            order: [["index", "ASC"]]  // Order case studies by index
          }],
          attributes: ["id", "title", "description", "image"],
        },
      ],
      order: [["index", "ASC"]]  // Order by index ascending
    });

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

// New function to reorder industry pages
exports.reorderIndustryPages = async (req, res, next) => {
  try {
    const { firstIndustryPageId, secondIndustryPageId } = req.body;

    // Find both industry pages
    const firstIndustryPage = await IndustryPage.findByPk(firstIndustryPageId);
    const secondIndustryPage = await IndustryPage.findByPk(secondIndustryPageId);

    if (!firstIndustryPage || !secondIndustryPage) {
      return responseGenerator(
        res,
        'One or both industry pages not found',
        statusCodeVars.NOT_FOUND
      );
    }

    // Store the original indices
    const firstIndex = firstIndustryPage.index;
    const secondIndex = secondIndustryPage.index;

    // Use IndustryPage.sequelize instead of direct sequelize reference
    await IndustryPage.sequelize.transaction(async (t) => {
      await firstIndustryPage.update({ index: secondIndex }, { transaction: t });
      await secondIndustryPage.update({ index: firstIndex }, { transaction: t });
    });

    const updatedIndustryPages = await IndustryPage.findAll({
      order: [['index', 'ASC']]
    });

    return responseGenerator(
      res,
      'Industry pages reordered successfully',
      statusCodeVars.OK,
      updatedIndustryPages
    );
  } catch (err) {
    next(err);
  }
};
