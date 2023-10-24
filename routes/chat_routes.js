const express = require('express');
const router = express.Router();
const authRoutes = require('./auth_routes');
const userChatModel = require('../models/chat_model');
const User = require('../models/user_models');

router.get('/suggested-users',authRoutes.verifyToken, async(req,res)=>{
  const list = await userChatModel.find({},{name:1, email: 1, imgPath: 1})
  res.status(200).json(list)
})
router.get('/search-user', authRoutes.verifyToken, async (req, res)=>{
  if(req.query.email){
    const list = await userChatModel.find({email: req.query.email},{name:1, email: 1, imgPath:1})
    if(list){
      res.status(200).json(list)
    }else{
      res.status(404).json({message: "No user Found"})
    }
  }else if(req.query.name){
    const list = await userChatModel.find({name: req.query.name},{name:1, email: 1, imgPath:1})
    if(list){
      res.status(200).json(list)
    }else{
      res.status(404).json({message: "No user Found"})
    }
  }
})
router.get('/getAllTargetEmails',authRoutes.verifyToken,async (req,resp)=>{// for fetching messages
  try {
    const userChat = await userChatModel.findOne({
      email:req.authData.email
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

router.get('/getBasicDetails', authRoutes.verifyToken, async (req, resp) => {//for updating the profile photos and names in the chat
  try {
    const targetEmails = req.query.targetEmails.split(',');

    const basicDetails = [];
    for (const targetEmail of targetEmails) {
      const targetUser = await User.findOne({ email: targetEmail });
      if (targetUser) {
        basicDetails.push({
          email: targetEmail,
          name: targetUser.name,
          imgPath: targetUser.imgPath,
        });
      }
    }

    resp.status(200).json(basicDetails);
  } catch (error) {
    resp.status(500).json({ message: 'server error' });
  }
});

router.post('/getChatHistory', authRoutes.verifyToken, async (req, resp) => {
  try {
    const userChat = await userChatModel.findOne({
      email: req.authData.email,
    });
    
    if (!userChat) {
      return resp.status(404).json({ message: 'User chat history not found' });
    }

    const targetEmail = req.body.targetEmail; 
    
    const targetChat = userChat.chats.find(chat => chat.targetEmail === targetEmail);
    if (targetChat) {
      
      resp.status(200).json(targetChat.messages.reverse().limit(30));
    } else {
      resp.status(404).json({ message: 'Chat history for target user not found' });
    }
  } catch (error) {
    console.error('Error fetching chat history:', error);
    resp.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
