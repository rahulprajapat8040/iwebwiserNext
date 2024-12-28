const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');

// get 
router.get('/getAllBranch', branchController.getAllBranch);

router.get('/getBranch/:id', branchController.getBranchById);

router.get('/searchBranch', branchController.searchBranch)
router.get('/getBranchByPageId', branchController.getBranchByPageId);

//create
router.post('/createBranch', branchController.createBranch);

router.put('/updataBranch/:id' , branchController.updateBranch)

router.delete('/deleteBranch/:id', branchController.deleteBranch);

module.exports = router;