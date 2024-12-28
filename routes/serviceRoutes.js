const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { uploadMedia } = require('../Middleware/uploadImages');

// get 
router.get('/getAllService', serviceController.getAllService);

router.get('/getService/:id', serviceController.getServiceById);

router.get('/searchServiceByTitle', serviceController.searchServiceByTitle)

//create
router.post('/createService', serviceController.createService);

router.put('/updataService/:id' , serviceController.updateService)

router.delete('/deleteService/:id', serviceController.deleteService);


module.exports = router;