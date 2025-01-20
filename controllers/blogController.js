const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const {
  setCacheData,
  getCacheData,
  deleteCacheData,
} = require("../helper/redis.helper.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { Blog } = require("../models/index.js");
const { Op } = require('sequelize');

exports.createBlog = async (req, res, next) => {
  try {
    const { title, description, blog_link, image, alt } = req.body;
    const newBlog = await Blog.create({
      title,
      description,
      blog_link,
      image,
      alt,
    });
    return responseGenerator(res, vars.BLOG_CREATE, statusCodeVars.OK, newBlog);
  } catch (err) {
    next(err);
  }
};

exports.updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, blog_link, image, alt } = req.body;

    const blog = await Blog.findByPk(id);
    dataNotExist(Blog, vars.BLOG_NOT_FOUND, statusCodeVars.NOT_FOUND);

    const updatedBlog = await blog.update({
      title,
      description,
      blog_link,
      image,
      alt,
    });
    return responseGenerator(
      res,
      vars.BLOG_UPDATAE,
      statusCodeVars.OK,
      updatedBlog
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllBlog = async (req, res, next) => {
  try {
    const { page, limit, showAll } = req.query;

    let blogs;
    let pageInfo = null;

    if (showAll === "true") {
      // Fetch all blogs without pagination
      blogs = await Blog.findAll({ order: [["createdAt", "ASC"]] });
    } else {
      // Handle pagination
      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;

      const { rows, count: totalItems } = await Blog.findAndCountAll({
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
        order: [["createdAt", "ASC"]],
      });

      blogs = rows;
      const totalPages = Math.ceil(totalItems / pageSize);

      pageInfo = {
        currentPage: pageNumber,
        totalPages,
        totalItems,
      };
    }

    return responseGenerator(res, vars.BLOG_GET, statusCodeVars.OK, {
      blogs,
      pageInfo, // Include pagination data within the same object
    });
  } catch (err) {
    next(err);
  }
};

exports.getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id);
    dataNotExist(blog, vars.BLOG_NOT_FOUND, statusCodeVars.NOT_FOUND);

    return responseGenerator(res, vars.BLOG_GET, statusCodeVars.OK, blog);
  } catch (err) {
    next(err);
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);
    dataNotExist(blog, vars.BLOG_NOT_FOUND, statusCodeVars.NOT_FOUND);
    await blog.destroy();
    return responseGenerator(res, vars.BLOG_DELETE, statusCodeVars.OK, blog);
  } catch (err) {
    next(err);
  }
};

exports.searchBlogByTitle = async (req, res) => {
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

    const results = await Blog.findAll({
      where: {
        title: {
          [Op.like]: `%${query}%`
        }
      }
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Blogs fetched successfully",
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
