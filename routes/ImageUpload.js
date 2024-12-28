const express = require('express');
const router = express.Router();
const uploadImage = require('../Middleware/uploadImages')
router.post('/uploadFile', uploadImage.uploadMedia)

module.exports = router;