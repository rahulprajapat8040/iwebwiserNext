const express = require("express");
const router = express.Router();
const technologyController = require("../controllers/technologyController");
const { uploadMedia } = require("../Middleware/uploadImages");

// get
router.get("/getAlltechnology", technologyController.getAllTechnology);

router.get("/gettechnology/:id", technologyController.getTechnologyById);

router.get("/searchtechnology", technologyController.searchTechnologyByTitle);

//create
router.post("/createtechnology", technologyController.createTechnology);

router.put("/updatatechnology/:id", technologyController.updateTechnology);

router.delete("/deletetechnology/:id", technologyController.deleteTechnology);

module.exports = router;
