const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { uploadMedia } = require('../Middleware/uploadImages');

// get 
router.get('/getAllCertificate', certificateController.getAllCertificate);

router.get('/getCertificate/:id', certificateController.getCertificateById);

router.get('/searchCertificate', certificateController.searchCertificateByTitle)

//create
router.post('/createCertificate', certificateController.createCertificate);

router.put('/updataCertificate/:id' , certificateController.updateCertificate)

router.delete('/deleteCertificate/:id', certificateController.deleteCertificate);


module.exports = router;