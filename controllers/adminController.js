const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendMail = require("../helper/sendMail");
const { responseGenerator } = require("../helper/functions.helper");
const { vars } = require("../server/constants");
const { statusCodeVars } = require("../server/statusCode");
const { dataNotExist } = require("../helper/check_existence.helper");
const { generateToken } = require("../services/auth.service");
const { Op } = require("sequelize");
const { User } = require("../models/index");
exports.getAlluser = async (req, res, next) => {
  try {
    const users = await User.findAll();
    responseGenerator(res, vars.USER_GET, statusCodeVars.OK, users);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ where: { id } });
    dataNotExist(user, vars.USER_NOT_FOUND, statusCodeVars.NOT_FOUND);
    responseGenerator(res, vars.USER_GET, statusCodeVars.OK, user);
  } catch (error) {
    next(error);
  }
};

(exports.register = async (req, res, next) => {
  const { username, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser)
      return res.status(400).json({ message: vars.EXISTS_USER });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || "admin",
    });
    return responseGenerator(
      res,
      vars.CREATE_USER,
      statusCodeVars.CREATED,
      user
    );
  } catch (error) {
    next(error);
  }
}),
  (exports.updataUser = async (req, res, next) => {
    const { id } = req.params;
    const { username, email, password } = req.body;
    try {
      const existingUser = await User.findOne({ where: { id } });
      dataNotExist(
        existingUser,
        vars.USER_NOT_FOUND,
        statusCodeVars.BADREQUEST
      );

      const updateData = { username, email };
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
      }

      const [updated] = await User.update(updateData, { where: { id } });
      if (!updated) {
        return responseGenerator(
          res,
          vars.USER_UPDATAE,
          statusCodeVars.BADREQUEST,
          null
        );
      }

      const updatedUser = await User.findOne({ where: { id } });
      return responseGenerator(
        res,
        vars.USER_UPDATAE,
        statusCodeVars.OK,
        updatedUser
      );
    } catch (error) {
      next(error);
    }
  }),
  (exports.login = async (req, res, next) => {
    const { username, password } = req.body;
    console.log(username)


    try {
      // Ensure username is provided
      if (!username) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Username is required",
          data: null,
        });
      }

      // Find user by username
      const user = await User.findOne({
        where: { username },
      });

      if (!user) {
        return responseGenerator(
          res,
          vars.DATA_NOT_FOUND,
          statusCodeVars.NOT_FOUND,
          null
        );
      }

      if (!password) {
        return responseGenerator(
          res,
          vars.INVALID_PASSWORD,
          statusCodeVars.UNAUTHORIZED,
          null
        );
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return responseGenerator(
          res,
          vars.INVALID_PASSWORD,
          statusCodeVars.UNAUTHORIZED,
          null
        );
      }

      // Generate token
      const tokendetails = await generateToken(user.id);
      console.log("token", tokendetails);

      user.isVerified = true;
      user.accessToken = tokendetails.accessToken;
      user.accessTokenExpires = tokendetails.accessTokenExpires;
      user.save();

      return responseGenerator(res, vars.LOGIN, statusCodeVars.OK, user);
    } catch (error) {
      next(error);
    }
  }),
  (exports.requestPasswordReset = async (req, res, next) => {
    const { username } = req.body;
    try {
      const user = await User.findOne({ where: { username } });
      if (!user || user.role !== "admin")
        return res.status(400).json({ message: vars.NOT_FOUND_USER });
      const verificationCode = crypto.randomBytes(3).toString("hex");
      user.resetToken = verificationCode;
      user.resetTokenExpires = Date.now() + 3600000;
      await user.save();
      await sendMail(user.email, "Reset Password ", verificationCode);
      responseGenerator(res, vars.SEND_CODE, statusCodeVars.OK, verificationCode);
    } catch (error) {
      next(error);
    }
  }),
  (exports.resetPassword = async (req, res, next) => {
    const { username, verificationCode, newPassword } = req.body;
    try {
      const user = await User.findOne({ where: { username } });
      if (!user) return res.status(400).json({ message: vars.NOT_FOUND_USER });
      user.password = await bcrypt.hash(newPassword, 10);
      user.resetToken = null;
      user.resetTokenExpires = null;
      await user.save();
      responseGenerator(res, vars.RESET_PASSWORD, statusCodeVars.OK, null);
    } catch (error) {
      next(error);
    }
  });

exports.updateProfile = async (req, res, next) => {
  const { id } = req.params;
  const { image } = req.body;
  try {
    const user = await User.findOne({ where: { id } });
    dataNotExist(user, vars.USER_NOT_FOUND, statusCodeVars.NOT_FOUND);
    user.image = image;
    await user.save();
    responseGenerator(res, vars.USER_UPDATAE, statusCodeVars.OK, user);
  } catch (error) {
    next(error);
  }
};
