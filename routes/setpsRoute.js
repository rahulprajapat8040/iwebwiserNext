const express = require("express");
const router = express.Router();
const setps = require("../controllers/setpsController");

// get

router.get("/getAllSteps", setps.getAllSteps);
router.get("/getStepsById/:id", setps.getStepsById);

// create
router.post("/createSteps", setps.createSteps);

// update
router.put("/updateSteps/:id", setps.updateSteps);

// delete

router.delete("/deleteSteps/:id", setps.deleteSteps);

module.exports = router