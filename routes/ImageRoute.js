const express = require('express');
const router = express.Router();
const { uploadMedia } = require('../Middleware/uploadImages');

router.post('/imageUploader' , uploadMedia )

module.exports = router;
