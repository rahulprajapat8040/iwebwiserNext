const express = require('express');
const router = express.Router();
const subServiceController = require('../controllers/subServiceController');

router.get('/getAllSubService', subServiceController.getAllSubServices);
router.get('/getById/:id', subServiceController.getSubServiceById);
router.get('/getByServiceId/:service_id', subServiceController.getSubServiceByServiceId);
router.get('/searchByTitle', subServiceController.searchSubServiceByTitle);
router.post('/createSubService', subServiceController.createSubService);
router.put('/updataSubService/:id', subServiceController.updateSubService);
router.delete('/deleteSubService/:id', subServiceController.deleteSubService);

module.exports = router;