const {
  responseGenerator,
  parseIfString,
} = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const {
  setCacheData,
  getCacheData,
  deleteCacheData,
} = require("../helper/redis.helper.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { CaseStudy, Industry } = require("../models/index.js");
const { Op } = require("sequelize");

exports.createCaseStudy = async (req, res, next) => {
  try {
    const {
      addCaseStudy,
      userCertificate,
      challenges,
      impact,
      system_phase,
      addtional_information,
      slug,
      metas,
    } = req.body;

    const newCaseStudy = await CaseStudy.create({
      addCaseStudy,
      userCertificate,
      challenges,
      impact,
      system_phase,
      addtional_information,
      slug,
      metas,
      industryId: req.body.industryId,
    });

    const pardata = JSON.stringify(newCaseStudy);
    return responseGenerator(
      res,
      vars.CASE_STUDY_CREATE,
      statusCodeVars.OK,
      pardata
    );
  } catch (err) {
    next(err);
  }
};

exports.updateCaseStudy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      addCaseStudy,
      userCertificate,
      challenges,
      impact,
      system_phase,
      addtional_information,
      slug,
      metas,
    } = req.body;

    const caseStudy = await CaseStudy.findByPk(id);
    dataNotExist(
      caseStudy,
      vars.CASE_STUDY_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    const updatedCaseStudy = await caseStudy.update({
      addCaseStudy,
      userCertificate,
      challenges,
      impact,
      system_phase,
      addtional_information,
      slug,
      metas,
      industryId: req.body.industryId,
    });
    return responseGenerator(
      res,
      vars.CASE_STUDY_UPDATAE,
      statusCodeVars.OK,
      updatedCaseStudy
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllCaseStudy = async (req, res, next) => {
  try {
    const { page, limit, showAll } = req.query;

    let cases;
    let pageInfo = null;

    if (showAll === "true") {
      // Fetch all case studies without pagination
      cases = await CaseStudy.findAll({
        include: {
          model: Industry,
          as: "industry",
        },
      });
    } else {
      // Handle pagination
      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;

      const { rows, count: totalItems } = await CaseStudy.findAndCountAll({
        include: {
          model: Industry,
          as: "industry",
        },
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
      });

      cases = rows;
      const totalPages = Math.ceil(totalItems / pageSize);

      pageInfo = {
        currentPage: pageNumber,
        totalPages,
        totalItems,
      };
    }

    const parserData = cases.map((caseStudy) =>
      parseIfString(caseStudy, [
        "addCaseStudy",
        "system_phase",
        "userCertificate",
        "challenges",
        "impact",
        "addtional_information",
      ])
    );

    return responseGenerator(res, vars.CASE_STUDY_GET, statusCodeVars.OK, {
      caseStudies: parserData,
      pageInfo,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCaseStudyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if id exists
    if (!id) {
      return responseGenerator(
        res,
        "Case Study ID is required",
        statusCodeVars.BAD_REQUEST
      );
    }

    const caseStudy = await CaseStudy.findOne({
      where: { id },
      include: {
        model: Industry,
        as: "industry",
      },
    });
    const parserData = parseIfString(caseStudy, [
      "addCaseStudy",
      "system_phase",
      "userCertificate",
      "challenges",
      "impact",
      "addtional_information",
    ]);
    dataNotExist(
      parserData,
      vars.CASE_STUDY_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    return responseGenerator(
      res,
      vars.CASE_STUDY_GET,
      statusCodeVars.OK,
      caseStudy
    );
  } catch (err) {
    next(err);
  }
};

exports.getCaseStudyBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Check if id exists
    if (!slug) {
      return responseGenerator(
        res,
        "Case Study slug is required",
        statusCodeVars.CASE_STUDY_NOT_FOUND
      );
    }

    const caseStudy = await CaseStudy.findOne({
      where: { slug },
      include: {
        model: Industry,
        as: "industry",
      },
    });
    const parserData = parseIfString(caseStudy, [
      "addCaseStudy",
      "system_phase",
      "userCertificate",
      "challenges",
      "impact",
      "addtional_information",
      "metas"
      
    ]);
    return responseGenerator(
      res,
      vars.CASE_STUDY_GET,
      statusCodeVars.OK,
      caseStudy
    );
  } catch (err) {
    next(err);
  }
};

exports.deleteCaseStudy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const caseStudy = await CaseStudy.findByPk(id);
    dataNotExist(
      caseStudy,
      vars.CASE_STUDY_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );
    await caseStudy.destroy();
    return responseGenerator(
      res,
      vars.CASE_STUDY_DELETE,
      statusCodeVars.OK,
      caseStudy
    );
  } catch (err) {
    next(err);
  }
};

exports.searchCaseStudyByTitle = async (req, res) => {
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

    const results = await CaseStudy.findAll({
      where: {
        addCaseStudy: {
          title: {
            [Op.like]: `%${query}%`,
          },
        },
      },
      include: {
        model: Industry,
        as: "industry",
      },
    });

    const parserData = results.map((caseStudy) =>
      parseIfString(caseStudy, [
        "addCaseStudy",
        "system_phase",
        "userCertificate",
        "challenges",
        "impact",
      ])
    );

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Case studies fetched successfully",
      data: parserData,
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

exports.getCaseIndusty = async (req, res) => {
  try {
    const result = await Industry.findAll({
      include: [
        {
          model: CaseStudy,
          as: "caseStudies",
        },
      ],
    });
    return responseGenerator(
      res,
      vars.CASE_STUDY_GET,
      statusCodeVars.OK,
      result
    );
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
