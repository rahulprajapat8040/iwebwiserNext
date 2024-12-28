const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const {
  setCacheData,
  getCacheData,
  deleteCacheData,
} = require("../helper/redis.helper.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { Header, SubHeader, SubChildHeader } = require("../models/index.js");

exports.createHeader = async (req, res, next) => {
  try {
    const { title, link, subHeaders } = req.body;
    const newHeader = await Header.create({
      title,
      link,
    });

    if (subHeaders) {
      await Promise.all(
        subHeaders.map(async (subHeader) => {
          const createdSubHeader = await SubHeader.create({
            title: subHeader.title,
            link: subHeader.link,
            headerId: newHeader.id,
          });

          if (subHeader.subMenuHeaders) {
            await Promise.all(
              subHeader.subMenuHeaders.map(async (subChildHeader) => {
                await SubChildHeader.create({
                  title: subChildHeader.title,
                  link: subChildHeader.link,
                  subHeaderId: createdSubHeader.id,
                });
              })
            );
          }
        })
      );
    }

    return responseGenerator(
      res,
      vars.Header_CREATE,
      statusCodeVars.OK,
      newHeader
    );
  } catch (err) {
    next(err);
  }
};

exports.updateHeader = async (req, res, next) => {
  try {
    const { id } = req.params; // ID to find and update
    const { title, link } = req.body;

    // Define models and corresponding fields
    const entities = [
      { model: Header, message: vars.Header_UPDATAE },
      { model: SubHeader, message: vars.Header_UPDATAE },
      { model: SubChildHeader, message: vars.Header_UPDATAE },
    ];

    // Check each entity for the ID and update if found
    for (const entity of entities) {
      const record = await entity.model.findByPk(id);
      if (record) {
        // Update record with provided fields
        const updatedRecord = await record.update({ title, link });
        return responseGenerator(
          res,
          vars.Header_UPDATAE,
          statusCodeVars.OK,
          `${entity.model.name} with ID ${id} updated successfully`,
          updatedRecord
        );
      }
    }

    // If ID is not found in any table
    return responseGenerator(res, vars.ID_NOT_FOUND);
  } catch (err) {
    next(err);
  }
};

exports.getAllHeader = async (req, res, next) => {
  try {
    const headers = await Header.findAll({
      order: [["createdAt", "ASC"]], // Order Headers by createdAt
      include: [
        {
          model: SubHeader,
          as: "subheaders",
          required: false,
          separate: true, // Fetch SubHeaders in a separate query
          order: [["createdAt", "ASC"]], // Order SubHeaders by createdAt
          include: [
            {
              model: SubChildHeader,
              as: "menuHeaders",
              required: false,
              separate: true, // Fetch SubChildHeaders in a separate query
              order: [["createdAt", "ASC"]], // Order SubChildHeaders by createdAt
            },
          ],
        },
      ],
    });

    return responseGenerator(res, vars.Header_GET, statusCodeVars.OK, headers);
  } catch (err) {
    next(err);
  }
};

exports.getHeaderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const header = await Header.findOne({
      where: { id },
      include: SubHeader,
    });
    dataNotExist(header, vars.Header_NOT_FOUND, statusCodeVars.NOT_FOUND);

    return responseGenerator(res, vars.Header_GET, statusCodeVars.OK, header);
  } catch (err) {
    next(err);
  }
};

exports.deleteHeader = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Define models and corresponding fields
    const entities = [
      { model: Header, message: vars.Header_DELETE },
      { model: SubHeader, message: vars.Header_DELETE },
      { model: SubChildHeader, message: vars.Header_DELETE },
    ];

    // Check each entity for the ID and delete if found
    for (const entity of entities) {
      const record = await entity.model.findByPk(id);
      if (record) {
        await record.destroy();
        return responseGenerator(
          res,
          entity.message,
          statusCodeVars.OK,
          `${entity.model.name} with ID ${id} deleted successfully`
        );
      }
    }

    // If ID is not found in any table
    return responseGenerator(res, vars.ID_NOT_FOUND);
  } catch (err) {
    next(err);
  }
};
