const express = require("express");
const router = express.Router();
const socialMediaController = require("../controllers/socialMediaController");
const isAuth = require("../Middleware/auth");

// get
router.get("/getAllsocialMedia", socialMediaController.getAllSocialMedia);
router.get("/getActivesocialMedia", socialMediaController.getActiveSocialMedia);
router.get("/searchSoicalMedia", socialMediaController.searchSocialMedia);

router.get("/getsocialMedia/:id", socialMediaController.getSocialMediaById);

router.put("/updatasocialMedia", socialMediaController.updateSocialMedia);
router.put("/reorder", socialMediaController.reorderSocialMedia);

router.delete(
  "/deletesocialMedia/:id",
  socialMediaController.deleteSocialMedia
);

module.exports = router;
