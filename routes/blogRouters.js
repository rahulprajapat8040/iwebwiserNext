const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { uploadMedia } = require('../Middleware/uploadImages');

// get 
router.get('/getAllBlog', blogController.getAllBlog);

router.get('/getBlog/:id', blogController.getBlogById);

//create
router.post('/createBlog', blogController.createBlog);

router.put('/updataBlog/:id' , blogController.updateBlog)

router.delete('/deleteBlog/:id', blogController.deleteBlog);

module.exports = router;