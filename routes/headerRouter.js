const express = require('express');
const router = express.Router();
const HeaderController = require('../controllers/headerController');
const { uploadMedia } = require('../Middleware/uploadImages');

// get 
router.get('/getAllHeader', HeaderController.getAllHeader);

router.get('/getHeader/:id', HeaderController.getHeaderById);

//create
router.post('/createHeader', HeaderController.createHeader);

router.put('/updataHeader/:id' , HeaderController.updateHeader)

router.delete('/deleteHeader/:id', HeaderController.deleteHeader);


module.exports = router;