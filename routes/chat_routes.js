const express = require('express');
const router = express.Router();
const authRoutes = require('./auth_routes');
const userChatModel = require('../models/chat_model');

router.get('/getAllTargetEmails',authRoutes.verifyToken,async (req,resp)=>{
  try {
    const userChat = await userChatModel.findOne({
      email:req.authData.user.email
    })
    if (!userChat) {
      return resp.status(404).json({ message: 'User chat history not found' });
    }
    const targetEmails = userChat.chats.map(chat => chat.targetEmail);
    resp.status(200).json(targetEmails);
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

    const targetEmail = req.body.targetEmail; 
    
    const targetChat = userChat.chats.find(chat => chat.targetEmail === targetEmail);
    if (targetChat) {
      
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
