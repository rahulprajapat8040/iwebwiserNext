const express = require('express');
const router = express.Router();
const serviceDetailsController = require('../controllers/serviceDetailsController');

router.post('/createServiceDetail', serviceDetailsController.createServiceDetail);
router.get('/getServiceDetail', serviceDetailsController.getAllServiceDetails);
router.get('/getserviceDetailById/:id', serviceDetailsController.getServiceDetailById);
router.get('/getserviceDetailByServiceId/:service_id', serviceDetailsController.getServiceDetailByServiceId);
router.put('/updateServiceDetail/:id', serviceDetailsController.updateServiceDetail);
router.delete('/deleteServiceDetail/:id', serviceDetailsController.deleteServiceDetail);

module.exports = router;
