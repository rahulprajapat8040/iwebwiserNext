const express = require("express");
const router = express.Router();
const industryController = require("../controllers/industryController");
const { uploadMedia } = require("../Middleware/uploadImages");

// get
router.get("/getAllIndustry", industryController.getAllIndustry);

router.get("/getIndustry/:id", industryController.getIndustryById);

router.get("/searchIndustryByTitle", industryController.searchIndustryByTitle);


//create
router.post("/createIndustry", industryController.createIndustry);

router.put("/updataIndustry/:id", industryController.updateIndustry);

// reorder industries
router.put("/swapIndexs", industryController.reorderIndustries);

router.delete("/deleteIndustry/:id", industryController.deleteIndustry);

module.exports = router;
