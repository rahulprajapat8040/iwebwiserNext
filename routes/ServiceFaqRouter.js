const express = require('express');
const router = express.Router();
const serviceFqaController = require('../controllers/serviceFqaController');

router.get('/getAllServiceFaq', serviceFqaController.getAllServiceFaq);
router.get('/getServiceFaqById/:id', serviceFqaController.getServiceFaqById);
router.get('/serarchServiceFaq', serviceFqaController.searchServiceFaq);
router.post('/createServiceFaq', serviceFqaController.createServiceFaq);
router.put('/updataServiceFaq/:id', serviceFqaController.updateServiceFaq);
router.delete('/deleteServiceFaq/:id', serviceFqaController.deleteServiceFaq);      

module.exports = router;