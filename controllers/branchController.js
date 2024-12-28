const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const {
  setCacheData,
  getCacheData,
  deleteCacheData,
} = require("../helper/redis.helper.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { Branch } = require("../models/index.js");
const { Op } = require("sequelize");

exports.createBranch = async (req, res, next) => {
  try {
    const { title, address, city, state, zip_code, country, pageId } = req.body;
    const newBranch = await Branch.create({
      title,
      address,
      city,
      state,
      zip_code,
      country,
      pageId,
    });
    return responseGenerator(
      res,
      vars.BRANCH_CREATE,
      statusCodeVars.OK,
      newBranch
    );
  } catch (err) {
    next(err);
  }
};

exports.updateBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, address, city, state, zip_code, country, pageId } = req.body;

    const branch = await Branch.findByPk(id);
    dataNotExist(branch, vars.BRANCH_NOT_FOUND, statusCodeVars.NOT_FOUND);

    await branch.update({
      title,
      address,
      state,
      city,
      zip_code,
      country,
      pageId,
    });
    return responseGenerator(
      res,
      vars.BRANCH_UPDATAE,
      statusCodeVars.OK,
      branch
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllBranch = async (req, res, next) => {
  try {
    const { page, limit, showAll } = req.query;

    let branches;
    let pageInfo = null;

    if (showAll === "true") {
      // Fetch all branches without pagination
      branches = await Branch.findAll();
    } else {
      // Handle pagination
      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;

      const { rows, count: totalItems } = await Branch.findAndCountAll({
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
        order: [["createdAt", "ASC"]],
      });

      branches = rows;
      const totalPages = Math.ceil(totalItems / pageSize);

      pageInfo = {
        currentPage: pageNumber,
        totalPages,
        totalItems,
      };
    }

    return responseGenerator(res, vars.BRANCH_GET, statusCodeVars.OK, {
      branches,
      pageInfo, // Include pagination data within the same object
    });
  } catch (err) {
    next(err);
  }
};

exports.getBranchByPageId = async (req, res, next) => {
  try {
    // Fetch all branches from the database
    const branches = await Branch.findAll();

    // Check if branches exist, otherwise throw a not found error
    dataNotExist(branches, vars.BRANCH_NOT_FOUND, statusCodeVars.NOT_FOUND);

    // Filter branches based on pageId
    const globalBranches = branches.filter(
      (branch) => branch.pageId === "global"
    );
    const localBranches = branches.filter(
      (branch) => branch.pageId === "local"
    );

    // Return filtered branches
    return responseGenerator(res, vars.BRANCH_GET, statusCodeVars.OK, {
      globalBranches,
      localBranches,
    });
  } catch (err) {
    // Pass errors to the error-handling middleware
    next(err);
  }
};

exports.getBranchById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const branch = await Branch.findByPk(id);
    dataNotExist(branch, vars.BRANCH_NOT_FOUND, statusCodeVars.NOT_FOUND);

    return responseGenerator(res, vars.BRANCH_GET, statusCodeVars.OK, branch);
  } catch (err) {
    next(err);
  }
};

exports.deleteBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findByPk(id);
    dataNotExist(branch, vars.BRANCH_NOT_FOUND, statusCodeVars.NOT_FOUND);
    await branch.destroy();
    return responseGenerator(
      res,
      vars.BRANCH_DELETE,
      statusCodeVars.OK,
      branch
    );
  } catch (err) {
    next(err);
  }
};

exports.searchBranch = async (req, res) => {
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

    const searchConditions = {
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { city: { [Op.like]: `%${query}%` } },
        { country: { [Op.like]: `%${query}%` } },
        { address: { [Op.like]: `%${query}%` } },
        { pageId: { [Op.like]: `%${query}%` } },
      ],
    };

    const results = await Branch.findAll({
      where: searchConditions,
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Branches fetched successfully",
      data: results,
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
