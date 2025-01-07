const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/fieldController');

// get 
router.get('/getAllField', fieldController.getAllField);

router.get('/getFieldById/:id', fieldController.getFieldById);

router.get('/getFieldBySlug/:slug', fieldController.getFieldBySlug);

//create
router.post('/createField', fieldController.createField);

router.put('/updataField/:id' , fieldController.updateField)

router.delete('/deleteField/:id', fieldController.deleteField);      

module.exports = router;