const { responseGenerator } = require("../helper/functions.helper.js");
const { vars } = require("../server/constants.js");
const { statusCodeVars } = require("../server/statusCode.js");
const {
  setCacheData,
  getCacheData,
  deleteCacheData,
} = require("../helper/redis.helper.js");
const { dataNotExist } = require("../helper/check_existence.helper.js");
const { Banner, User } = require("../models/index.js");

let num = 1;
exports.createBanner = async (req, res, next) => {
  try {
    const { title, description, button_link, status, image } = req.body;

    // Check if a banner already exists
    const existingBanner = await Banner.findOne();
    if (existingBanner) {
      return res.status(400).json({
        success: false,
        message: "A banner already exists. Only one banner is allowed.",
      });
    }

    // Create a new banner
    const newBanner = await Banner.create({
      title,
      description,
      button_link,
      status,
      image,
    });

    return responseGenerator(
      res,
      vars.BANNER_CREATE,
      statusCodeVars.OK,
      newBanner
    );
  } catch (err) {
    next(err);
  }
};

exports.updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, button_link, status, image } = req.body;

    const banner = await Banner.findByPk(id);
    dataNotExist(Banner, vars.BANNER_NOT_FOUND, statusCodeVars.NOT_FOUND);

    const updatedBanner = await banner.update({
      title,
      description,
      button_link,
      status,
      image,
    });
    return responseGenerator(
      res,
      vars.BANNER_UPDATAE,
      statusCodeVars.OK,
      updatedBanner
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllBannerAdmin = async (req, res, next) => {
  try {
    // Fetch the single banner
    const banner = await Banner.findOne();

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "No banner found.",
      });
    }

    // Return the banner as an object
    return responseGenerator(res, vars.BANNER_GET, statusCodeVars.OK, banner);
  } catch (err) {
    next(err);
  }
};

exports.getAllActiveBanner = async (req, res, next) => {
  try {
    const banners = await Banner.findAll({ where: { status: true } });
    return responseGenerator(res, vars.BANNER_GET, statusCodeVars.OK, banners);
  } catch (err) {
    next(err);
  }
};

exports.getBannerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByPk(id);
    dataNotExist(banner, vars.BANNER_NOT_FOUND, statusCodeVars.NOT_FOUND);

    return responseGenerator(res, vars.BANNER_GET, statusCodeVars.OK, banner);
  } catch (err) {
    next(err);
  }
};

exports.deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByPk(id);
    dataNotExist(banner, vars.BANNER_NOT_FOUND, statusCodeVars.NOT_FOUND);
    await banner.destroy();
    return responseGenerator(
      res,
      vars.BANNER_DELETE,
      statusCodeVars.OK,
      banner
    );
  } catch (err) {
    next(err);
  }
};
