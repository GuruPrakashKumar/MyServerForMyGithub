const express = require('express');
const router = express.Router();
const authRoutes = require('./auth_routes'); // Assuming this is your auth middleware
const userChatModel = require('../models/chat_model'); // Import the chat model

router.get('/getAllTargetEmails',authRoutes.verifyToken,async (req,resp)=>{
  try {
    const userChat = await userChatModel.findOne({
      email:req.authData.user.email
    })
    if (!userChat) {
      return resp.status(404).json({ message: 'User chat history not found' });
    }
    const targetEmails = userChat.chats.map(chat => chat.targetEmail);
    
  } catch (error) {
    resp.status(500).json({message: 'server error'})
  }
})

router.post('/getChatHistory', authRoutes.verifyToken, async (req, resp) => {
  try {
    const userChat = await userChatModel.findOne({
      email: req.authData.user.email,
    });
    
    if (!userChat) {
      return resp.status(404).json({ message: 'User chat history not found' });
    }

    const targetEmail = req.body.targetEmail; // Assuming targetEmail is sent in the request body
    
    const targetChat = userChat.chats.find(chat => chat.targetEmail === targetEmail);
    if (targetChat) {
      // Found the chat history for the target user
      resp.status(200).json(targetChat.messages);
    } else {
      resp.status(404).json({ message: 'Chat history for target user not found' });
    }
  } catch (error) {
    console.error('Error fetching chat history:', error);
    resp.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
