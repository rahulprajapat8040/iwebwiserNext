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
const { Op, sequelize } = require('sequelize');

exports.createFeedback = async (req, res, next) => {
  try {
    const { title, description, sub_title, image, alt } = req.body;
    
    // Get the highest index
    const maxIndex = await Feedback.max('index') || 0;
    
    const newFeedback = await Feedback.create({
      title,
      description,
      sub_title,
      image,
      alt,
      index: maxIndex + 1  // Set the new index as highest + 1
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
    const { title, sub_title, description, button_link, image, alt } = req.body;

    const feedback = await Feedback.findByPk(id);
    dataNotExist(feedback, vars.FEEDBACK_NOT_FOUND, statusCodeVars.NOT_FOUND);

    await feedback.update({
      title,
      description,
      sub_title,
      button_link,
      image,
      alt
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
        order: [["index", "ASC"]]  // Order by index ascending
      });
    } else {
      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;

      const { rows, count: totalItems } = await Feedback.findAndCountAll({
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
        order: [["index", "ASC"]]  // Order by index ascending
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
      },
      order: [["index", "ASC"]]  // Order by index ascending
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

// New function to reorder feedbacks
exports.reorderFeedbacks = async (req, res, next) => {
  try {
    const { firstFeedbackId, secondFeedbackId } = req.body;

    // Find both feedbacks
    const firstFeedback = await Feedback.findByPk(firstFeedbackId);
    const secondFeedback = await Feedback.findByPk(secondFeedbackId);

    if (!firstFeedback || !secondFeedback) {
      return responseGenerator(
        res,
        'One or both feedbacks not found',
        statusCodeVars.NOT_FOUND
      );
    }

    // Store the original indices
    const firstIndex = firstFeedback.index;
    const secondIndex = secondFeedback.index;

    // Use Feedback.sequelize instead of direct sequelize reference
    await Feedback.sequelize.transaction(async (t) => {
      await firstFeedback.update({ index: secondIndex }, { transaction: t });
      await secondFeedback.update({ index: firstIndex }, { transaction: t });
    });

    const updatedFeedbacks = await Feedback.findAll({
      order: [['index', 'ASC']]
    });

    return responseGenerator(
      res,
      'Feedbacks reordered successfully',
      statusCodeVars.OK,
      updatedFeedbacks
    );
  } catch (err) {
    next(err);
  }
};
