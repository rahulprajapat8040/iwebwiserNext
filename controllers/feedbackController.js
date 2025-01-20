const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const {
  setCacheData,
  getCacheData,
  deleteCacheData,
} = require("../helper/redis.helper.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { Feedback, Industry } = require("../models/index.js");
const { Op } = require('sequelize');

exports.createFeedback = async (req, res, next) => {
  try {
    const { title, description, sub_title, image, alt, } = req.body;
    const newFeedback = await Feedback.create({
      title,
      description,
      sub_title,
      image,
      alt,

    });
    return responseGenerator(
      res,
      vars.FEEDBACK_CREATE,
      statusCodeVars.OK,
      newFeedback
    );
  } catch (err) {
    next(err);
  }
};

exports.updateFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, sub_title, description, button_link, image, alt, } = req.body;

    const feedback = await Feedback.findByPk(id);
    dataNotExist(feedback, vars.FEEDBACK_NOT_FOUND, statusCodeVars.NOT_FOUND);

    await feedback.update({
      title,
      description,
      sub_title,
      button_link,
      image,
      alt,

    });
    return responseGenerator(
      res,
      vars.FEEDBACK_UPDATAE,
      statusCodeVars.OK,
      feedback
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllFeedback = async (req, res, next) => {
  try {
    const { page, limit, showAll } = req.query;

    let feedbacks;
    let pageInfo = null;


    if (showAll === "true") {
      feedbacks = await Feedback.findAll({
        order: [["createdAt", "ASC"]]
      });
    } else {
      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;

      const { rows, count: totalItems } = await Feedback.findAndCountAll({
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
      });

      feedbacks = rows;
      const totalPages = Math.ceil(totalItems / pageSize);

      pageInfo = {
        currentPage: pageNumber,
        totalPages,
        totalItems,
      };
    }

    return responseGenerator(res, vars.FEEDBACK_GET, statusCodeVars.OK, {
      feedbacks,
      pageInfo,
    });
  } catch (err) {
    next(err);
  }
};

exports.getFeedbackById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByPk(id);
    dataNotExist(feedback, vars.FEEDBACK_NOT_FOUND, statusCodeVars.NOT_FOUND);

    return responseGenerator(
      res,
      vars.FEEDBACK_GET,
      statusCodeVars.OK,
      feedback
    );
  } catch (err) {
    next(err);
  }
};

exports.deleteFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findByPk(id);
    dataNotExist(feedback, vars.FEEDBACK_NOT_FOUND, statusCodeVars.NOT_FOUND);
    await feedback.destroy();
    return responseGenerator(
      res,
      vars.FEEDBACK_DELETE,
      statusCodeVars.OK,
      feedback
    );
  } catch (err) {
    next(err);
  }
};

exports.searchFeedbackByTitle = async (req, res) => {
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

    const results = await Feedback.findAll({
      where: {
        title: {
          [Op.like]: `%${query}%`
        }
      }
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Feedbacks fetched successfully",
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
