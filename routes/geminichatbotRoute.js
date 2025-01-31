const express = require('express');
const router = express.Router();
const { getWebsiteContent, getUserChatHistory, getAllChat } = require('../controllers/geminichatbot');

// Route for getting AI responses
router.post('/chat', getWebsiteContent);

// Route for getting all chats, 
router.get('/getAllChats', getAllChat)

// Route for getting user's chat history (protected route)
router.get('/history/:userId', getUserChatHistory);

module.exports = router;