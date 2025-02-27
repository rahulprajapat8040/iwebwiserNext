const express = require('express');
const router = express.Router();
const serviceDetailsController = require('../controllers/serviceDetailsController');

router.post('/createServiceDetail', serviceDetailsController.createServiceDetail);
router.get('/getServiceDetail', serviceDetailsController.getAllServiceDetails);
router.get('/getserviceDetailById/:id', serviceDetailsController.getServiceDetailById);
router.get('/getServicedetailBySlug/:slug', serviceDetailsController.getServicedetailBySlug);
router.put('/updateServiceDetail/:id', serviceDetailsController.updateServiceDetail);

// reorder service details
router.put('/swapIndexs', serviceDetailsController.reorderServiceDetails);

router.delete('/deleteServiceDetail/:id', serviceDetailsController.deleteServiceDetail);

module.exports = router;
