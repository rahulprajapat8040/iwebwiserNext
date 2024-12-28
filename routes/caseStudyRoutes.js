const express = require('express');
const router = express.Router();
const caseStudyController = require('../controllers/caseStudyController');
const { uploadMedia } = require('../Middleware/uploadImages');


router.get('/getAllCaseStudy', caseStudyController.getAllCaseStudy);

router.get('/getCaseStudy/:id', caseStudyController.getCaseStudyById);

router.get('/searchCaseStudy', caseStudyController.searchCaseStudyByTitle)

router.post('/createCaseStudy', caseStudyController.createCaseStudy);

router.put('/updataCaseStudy/:id' , caseStudyController.updateCaseStudy)

router.delete('/deleteCaseStudy/:id', caseStudyController.deleteCaseStudy);

module.exports = router;