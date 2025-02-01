const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { Field, Service, ServiceDetails } = require("../models/index.js");

exports.createField = async (req, res, next) => {
  try {
    const {
      title,
      short_description,
      description,
      buttonText,
      buttonLink,
      image,
      slug,
      alt,
      metas,
    } = req.body;
    const newField = await Field.create({
      slug,
      title,
      short_description,
      description,
      buttonText,
      buttonLink,
      image,
      alt,
      metas,
    });
    return responseGenerator(
      res,
      vars.FIELD_CREATE,
      statusCodeVars.OK,
      newField
    );
  } catch (err) {
    next(err);
  }
};

exports.updateField = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      short_description,
      buttonText,
      buttonLink,
      image,
      slug,
      alt,
      metas,
    } = req.body;

    const field = await Field.findByPk(id);
    dataNotExist(field, vars.FIELD_NOT_FOUND, statusCodeVars.NOT_FOUND);

    const updatedField = await field.update({
      title,
      short_description,
      description,
      buttonText,
      buttonLink,
      image,
      slug,
      alt,
      metas,
    });
    return responseGenerator(
      res,
      vars.FIELD_UPDATE,
      statusCodeVars.OK,
      updatedField
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllField = async (req, res, next) => {
  try {
    const fields = await Field.findAll({
      order: [["index", 'ASC']],
      include: [
        {
          model: Service,
          separate: true,
          order: [['index', 'ASC']],
          include: [
            {
              model: ServiceDetails,
              attributes: ["slug"],
            },
          ],
        },
      ],
    });
    return responseGenerator(res, vars.FIELD_GET, statusCodeVars.OK, fields);
  } catch (err) {
    next(err);
  }
};

exports.getFieldById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const field = await Field.findByPk(id);
    dataNotExist(field, vars.FIELD_NOT_FOUND, statusCodeVars.NOT_FOUND);

    return responseGenerator(res, vars.FIELD_GET, statusCodeVars.OK, field);
  } catch (err) {
    next(err);
  }
};

exports.deleteField = async (req, res, next) => {
  try {
    const { id } = req.params;
    const field = await Field.findByPk(id);
    dataNotExist(field, vars.FIELD_NOT_FOUND, statusCodeVars.NOT_FOUND);
    await field.destroy();
    return responseGenerator(res, vars.FIELD_DELETE, statusCodeVars.OK, field);
  } catch (err) {
    next(err);
  }
};

exports.getFieldBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const field = await Field.findOne({
      where: {
        slug: slug,
      },
      include: [
        {
          model: Service,
          separate: true,
          order: [['index', 'ASC']],
          include: [
            {
              model: ServiceDetails,
              attributes: ["slug"],
            },
          ],
        },
      ],
    });
    dataNotExist(field, vars.FIELD_NOT_FOUND, statusCodeVars.NOT_FOUND);
    return responseGenerator(res, vars.FIELD_GET, statusCodeVars.OK, field);
  } catch (err) {
    next(err);
  }
};

exports.reorderFields = async (req, res, next) => {
  try {
    const { firstFieldId, secondFieldId } = req.body;

    // Find both fields
    const firstField = await Field.findByPk(firstFieldId);
    const secondField = await Field.findByPk(secondFieldId);

    // Store the original indices
    const firstIndex = firstField.index;
    const secondIndex = secondField.index;

    // Use Field.sequelize for transaction
    await Field.sequelize.transaction(async (t) => {
      await firstField.update({ index: secondIndex }, { transaction: t });
      await secondField.update({ index: firstIndex }, { transaction: t });
    });

    const updatedFields = await Field.findAll({
      order: [['index', 'ASC']],
      include: [
        {
          model: Service,
          separate: true,
          order: [['index', 'ASC']],
          include: [
            {
              model: ServiceDetails,
              attributes: ["slug"],
            },
          ],
        },
      ],
    });

    return responseGenerator(
      res,
      'Fields reordered successfully',
      statusCodeVars.OK,
      updatedFields
    );
  } catch (err) {
    next(err);
  }
};
