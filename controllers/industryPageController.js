const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const {
  IndustryPage,
  Industry,
  CaseStudy,
} = require("../models/index.js");

exports.createIndustryPage = async (req, res, next) => {
  try {
    const {
      industry_id,
      hero_title,
      slug,
      hero_description,
      industry_title,
      industry_description,
      industrySolution,
      metas,
    } = req.body;


    const newIndustryPage = await IndustryPage.create({
      industry_id,
      slug,
      hero_title,
      hero_description,
      industry_title,
      industry_description,
      industrySolution,
      metas,
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
            as: 'caseStudies'
          }],
          attributes: ["id", "title", "description", "image"],
        },
      ],
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
            as: 'caseStudies'

          }],
          attributes: ["id", "title", "description", "image"], // Updated attributes to match Industry model
        },
      ],
    });

    dataNotExist(
      industryPage,
      "Industry page not found",
      statusCodeVars.NOT_FOUND
    );

    industryPage.setDataValue("industrySolution", JSON.parse(industryPage.industrySolution));

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
