const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/bannerController");
// const isAuth = require('../Middleware/auth')
// get
router.get("/getAllBanner", bannerController.getAllBannerAdmin);

router.get("/getActiveBanner", bannerController.getAllActiveBanner);

router.get("/getBanner/:id", bannerController.getBannerById);

//create
router.post("/createBanner", bannerController.createBanner);

router.put("/updataBanner/:id", bannerController.updateBanner);

router.delete("/deleteBanner/:id", bannerController.deleteBanner);

module.exports = router;
