const express = require('express');
const router = express.Router();
const authRoutes = require('./auth_routes');
const userChatModel = require('../models/chat_model');
const User = require('../models/user_models');

router.get('/suggested-users',authRoutes.verifyToken, async(req,res)=>{
  const userChat = await userChatModel.findOne({email: req.authData.email},{chats:1})
  const alreadyChatted = []
  const newUsers=[]
  for(chat of userChat.chats){
    alreadyChatted.push(chat.targetEmail)
  }
  // console.log(userChat)
  // console.log(alreadyChatted)
  const list = await userChatModel.find({},{name:1, email: 1, imgPath: 1})
  for(item of list){
    if(!alreadyChatted.includes(item.email) && item.email != req.authData.email){
      newUsers.push(item)
    }
  }
  res.status(200).json(newUsers)
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
  
    const userChat = await userChatModel.findOne({
      email:req.authData.email
    })
    if (!userChat) {
      return resp.status(404).json({ message: 'User chat history not found' });
    }
    const targetEmails = userChat.chats.map((chat) => {
      // Get the last message for each target email
      const lastMessage = chat.messages[chat.messages.length - 1];
      return {
        targetEmail: chat.targetEmail,
        lastMessage: lastMessage,
      };
    });
    resp.status(200).json(targetEmails.reverse());
 
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
      
      resp.status(200).json(targetChat.messages.reverse());
    } else {
      resp.status(404).json({ message: 'Chat history for target user not found' });
    }
  } catch (error) {
    console.error('Error fetching chat history:', error);
    resp.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
