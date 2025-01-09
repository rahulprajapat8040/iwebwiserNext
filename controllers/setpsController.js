const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { Steps } = require("../models/index.js");

exports.createSteps = async (req, res, next) => {
  try {
    const { title, description, image } = req.body;
    
    const newSteps = await Steps.create({
      title,
      description,
      image
    });

    return responseGenerator(
      res,
      vars.STEPS_CREATE,
      statusCodeVars.OK,
      newSteps
    );
  } catch (err) {
    next(err);
  }
};

exports.updateSteps = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, image } = req.body;

    const steps = await Steps.findByPk(id);
    dataNotExist(
      steps,
      vars.STEPS_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    const updatedSteps = await steps.update({
      title,
      description,
      image
    });

    return responseGenerator(
      res,
      vars.STEPS_UPDATE,
      statusCodeVars.OK,
      updatedSteps
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllSteps = async (req, res, next) => {
  try {
    const steps = await Steps.findAll();

    return responseGenerator(
      res,
      vars.STEPS_GET,
      statusCodeVars.OK,
      steps
    );
  } catch (err) {
    next(err);
  }
};

exports.getStepsById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const steps = await Steps.findByPk(id);
    dataNotExist(
      steps,
      vars.STEPS_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );

    return responseGenerator(
      res,
      vars.STEPS_GET,
      statusCodeVars.OK,
      steps
    );
  } catch (err) {
    next(err);
  }
};

exports.deleteSteps = async (req, res, next) => {
  try {
    const { id } = req.params;
    const steps = await Steps.findByPk(id);
    dataNotExist(
      steps,
      vars.STEPS_NOT_FOUND,
      statusCodeVars.NOT_FOUND
    );
    
    await steps.destroy();
    
    return responseGenerator(
      res,
      vars.STEPS_DELETE,
      statusCodeVars.OK,
      steps
    );
  } catch (err) {
    next(err);
  }
};
