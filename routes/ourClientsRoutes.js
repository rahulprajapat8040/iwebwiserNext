const express = require('express');
const router = express.Router();
const ourClientController = require('../controllers/ourClientsController');
const { uploadMedia } = require('../Middleware/uploadImages');

// get 
router.get('/getAllOurClient', ourClientController.getAllOurClient);

router.get('/getOurClient/:id', ourClientController.getOurClientById);

router.get('/searchOurClient', ourClientController.searchOurClientByTitle)

//create
router.post('/createOurClient', ourClientController.createOurClient);

router.put('/updataOurClient/:id' , ourClientController.updateOurClient)

router.delete('/deleteOurClient/:id', ourClientController.deleteOurClient);

module.exports = router;