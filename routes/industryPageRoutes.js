const express = require("express");
const router = express.Router();
const industryPage = require("../controllers/industryPageController");

// get

router.get("/getAllIndustryPage", industryPage.getAllIndustryPages);
router.get("/getIndustryPageBySlug/:slug", industryPage.getIndustryPageBySlug);
router.get("/getIndustryPageById/:id", industryPage.getIndustryById);

// create
router.post("/createIndustryPage", industryPage.createIndustryPage);

// update
router.put("/updateIndustryPage/:id", industryPage.updateIndustryPage);

// reorder industry pages
router.put("/swapIndexs", industryPage.reorderIndustryPages);

// delete

router.delete("/deleteIndustryPage/:id", industryPage.deleteIndustryPage);

module.exports = router