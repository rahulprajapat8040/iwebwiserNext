const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/getAlluser", adminController.getAlluser);
router.get("/getUser/:id", adminController.getUserById);

router.post("/register", adminController.register);
router.post("/login", adminController.login);

router.put("/updataUser/:id", adminController.updataUser);
router.put("/updateProfilepic/:id", adminController.updateProfile);

router.post("/request-reset", adminController.requestPasswordReset);
router.post("/reset", adminController.resetPassword);

module.exports = router;
