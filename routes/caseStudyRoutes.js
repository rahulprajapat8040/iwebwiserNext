const express = require('express');
const router = express.Router();
const caseStudyController = require('../controllers/caseStudyController');
const { uploadMedia } = require('../Middleware/uploadImages');


router.get('/getAllCaseStudy', caseStudyController.getAllCaseStudy);

router.get('/getCaseStudy/:id', caseStudyController.getCaseStudyById);

router.get('/searchCaseStudy', caseStudyController.searchCaseStudyByTitle)

router.get('/getCaseStudyBySlug/:slug', caseStudyController.getCaseStudyBySlug);

router.get('/getCaseIndusty', caseStudyController.getCaseIndusty);

router.post('/createCaseStudy', caseStudyController.createCaseStudy);

router.put('/updataCaseStudy/:id' , caseStudyController.updateCaseStudy)

// reorder case studies
router.put('/swapIndexs', caseStudyController.reorderCaseStudies)

router.delete('/deleteCaseStudy/:id', caseStudyController.deleteCaseStudy);

module.exports = router;