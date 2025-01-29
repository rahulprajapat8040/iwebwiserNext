const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { uploadMedia } = require('../Middleware/uploadImages');

// get 
router.get('/getAllFeedback', feedbackController.getAllFeedback);

router.get('/getFeedback/:id', feedbackController.getFeedbackById);

router.get('/searchFeedback', feedbackController.searchFeedbackByTitle)

//create
router.post('/createFeedback', feedbackController.createFeedback);

router.put('/updataFeedback/:id' , feedbackController.updateFeedback)

// reorder feedbacks
router.put('/swapIndexs', feedbackController.reorderFeedbacks)

router.delete('/deleteFeedback/:id', feedbackController.deleteFeedback);

module.exports = router;