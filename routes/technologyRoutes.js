const express = require("express");
const router = express.Router();
const technologyController = require("../controllers/technologyController.js");

// Get routes
router.get("/getAllTechnology", technologyController.getAllTechnology);
router.get("/active", technologyController.getActiveTechnology);
router.get("/searchtechnology", technologyController.searchTechnology);
router.get("/:id", technologyController.getTechnologyById);

// Protected routes
router.post("/createtechnology", technologyController.createTechnology);
router.put("/updataTechnology/:id", technologyController.updateTechnology);
router.delete("/deleteTechnology/:id", technologyController.deleteTechnology);
router.put("/swapIndexs", technologyController.reorderTechnologies);

module.exports = router;
