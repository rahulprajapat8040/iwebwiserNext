const { responseGenerator } = require('../helper/functions.helper.js')
const { vars } = require('../server/constants.js');
const { statusCodeVars } = require('../server/statusCode.js');
const { setCacheData, getCacheData, deleteCacheData } = require("../helper/redis.helper.js");
const {  dataNotExist } = require("../helper/check_existence.helper.js");
const {  Industry, Service } = require('../models/index.js');
const { Op } = require('sequelize');


exports.createIndustry = async (req, res, next) => {
    try {
        const { title, description, service_id, button_link, image } = req.body;
        const newIndustry = await Industry.create({
            title,
            description,
            service_id,
            button_link,
            image
        });
        return responseGenerator(res, vars.INDUSTRY_CREATE, statusCodeVars.OK, newIndustry);
    } catch (err) {
        next(err);
    }
};



exports.updateIndustry = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, service_id, button_link, image } = req.body;

        const industry = await Industry.findByPk(id);
        dataNotExist(industry , vars.INDUSTRY_NOT_FOUND , statusCodeVars.NOT_FOUND)

       const updatedIndustry = await industry.update({
            title,
            description,
            service_id,
            button_link,
            image
        });
        return responseGenerator(res, vars.INDUSTRY_UPDATAE, statusCodeVars.OK,updatedIndustry );
    } catch (err) {
        next(err);
    }
};


exports.getAllIndustry = async (req, res, next) => {
    try {
        const { page, limit, showAll } = req.query;

        let industryData;
        let pageInfo = null;

        if (showAll === "true") {
            // Fetch all industry data without pagination
            industryData = await Industry.findAll({
                include: [{
                    model: Service 
                }]
            });
        } else {
            // Handle pagination
            const pageNumber = parseInt(page) || 1;
            const pageSize = parseInt(limit) || 10;

            const { rows, count: totalItems } = await Industry.findAndCountAll({
                limit: pageSize,
                offset: (pageNumber - 1) * pageSize,
                include: [{
                    model: Service
                }]
            });

            industryData = rows;
            const totalPages = Math.ceil(totalItems / pageSize);

            pageInfo = {
                currentPage: pageNumber,
                totalPages,
                totalItems,
            };
        }

        return responseGenerator(res, vars.INDUSTRY_GET, statusCodeVars.OK, {
            industryData,
            pageInfo, // Include pagination data within the same object
        });
    } catch (err) {
        next(err);
    }
};



exports.getIndustryById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const industry = await Industry.findByPk(id);
        dataNotExist(industry , vars.INDUSTRY_NOT_FOUND , statusCodeVars.NOT_FOUND)
    
        return responseGenerator(res, vars.INDUSTRY_GET, statusCodeVars.OK, industry);
    } catch (err) {
        next(err);
    }
};



exports.deleteIndustry = async (req, res, next) => {
    try {
        const { id } = req.params;
        const industry = await Industry.findByPk(id);
        dataNotExist(industry , vars.INDUSTRY_NOT_FOUND , statusCodeVars.NOT_FOUND)
        await industry.destroy();
        return responseGenerator(res, vars.INDUSTRY_DELETE, statusCodeVars.OK, industry);
    } catch (err) {
        next(err);
    }
};

exports.searchIndustryByTitle = async (req, res) => {
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

    const results = await Industry.findAll({
      where: {
        title: {
          [Op.like]: `%${query}%`
        }
      }
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Industries fetched successfully",
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

