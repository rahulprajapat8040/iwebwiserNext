const { responseGenerator } = require('../helper/functions.helper.js');
const { vars } = require('../server/constants.js');
const { statusCodeVars } = require('../server/statusCode.js');
const { setCacheData, getCacheData, deleteCacheData } = require("../helper/redis.helper.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { ServiceFaq, Service } = require('../models/index.js');
const { Op } = require('sequelize');

exports.createServiceFaq = async (req, res, next) => {
    try {
        const { service_id, question, answer } = req.body;
        const newServiceFaq = await ServiceFaq.create({
            service_id,
            question,
            answer
        });
        return responseGenerator(res, vars.SERVICE_FAQ_CREATE, statusCodeVars.OK, newServiceFaq);
    } catch (err) {
        next(err);
    }
};

exports.updateServiceFaq = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { service_id, question, answer } = req.body;

        const serviceFaq = await ServiceFaq.findByPk(id);
        dataNotExist(serviceFaq, vars.SERVICE_FAQ_NOT_FOUND, statusCodeVars.NOT_FOUND);

        const updatedServiceFaq = await serviceFaq.update({
            service_id,
            question,
            answer
        });
        return responseGenerator(res, vars.SERVICE_FAQ_UPDATE, statusCodeVars.OK, updatedServiceFaq);
    } catch (err) {
        next(err);
    }
};

exports.getAllServiceFaq = async (req, res, next) => {
    try {
        const { page, limit, showAll } = req.query;

        let serviceFaqs;
        let pageInfo = null;

        if (showAll === "true") {
            serviceFaqs = await ServiceFaq.findAll();
        } else {
            const pageNumber = parseInt(page) || 1;
            const pageSize = parseInt(limit) || 10;

            const { rows, count: totalItems } = await ServiceFaq.findAndCountAll({
                limit: pageSize,
                offset: (pageNumber - 1) * pageSize,
                include: [{ model: Service, attributes: ['id', 'title'] }],
            });

            serviceFaqs = rows;
            const totalPages = Math.ceil(totalItems / pageSize);

            pageInfo = {
                currentPage: pageNumber,
                totalPages,
                totalItems,
            };
        }

        return responseGenerator(res, vars.SERVICE_FAQ_GET, statusCodeVars.OK, {
            serviceFaqs,
            pageInfo,
        });
    } catch (err) {
        next(err);
    }
};

exports.getServiceFaqById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const serviceFaq = await ServiceFaq.findByPk(id);
        dataNotExist(serviceFaq, vars.SERVICE_FAQ_NOT_FOUND, statusCodeVars.NOT_FOUND);

        return responseGenerator(res, vars.SERVICE_FAQ_GET, statusCodeVars.OK, serviceFaq);
    } catch (err) {
        next(err);
    }
};

exports.deleteServiceFaq = async (req, res, next) => {
    try {
        const { id } = req.params;
        const serviceFaq = await ServiceFaq.findByPk(id);
        dataNotExist(serviceFaq, vars.SERVICE_FAQ_NOT_FOUND, statusCodeVars.NOT_FOUND);
        await serviceFaq.destroy();
        return responseGenerator(res, vars.SERVICE_FAQ_DELETE, statusCodeVars.OK, serviceFaq);
    } catch (err) {
        next(err);
    }
};

exports.searchServiceFaq = async (req, res) => {
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

        const results = await ServiceFaq.findAll({
            where: {
                [Op.or]: [
                    { question: { [Op.like]: `%${query}%` } },
                    { '$Service.title$': { [Op.like]: `%${query}%` } }
                ]
            },
            include: [
                {
                    model: Service,
                    attributes: ['id', 'title'],
                },
            ],
        });

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Service FAQs fetched successfully",
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
