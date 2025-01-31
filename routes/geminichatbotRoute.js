const express = require('express');
const router = express.Router();
const { getWebsiteContent, getUserChatHistory } = require('../controllers/geminichatbot');

// Route for getting AI responses
router.post('/chat', getWebsiteContent);

// Route for getting user's chat history (protected route)
router.get('/history/:userId' , getUserChatHistory);

module.exports = router;