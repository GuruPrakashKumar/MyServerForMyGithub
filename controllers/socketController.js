const clients = {};
const { json } = require('express');
const User = require('../models/user_models');


module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log("Connected to Socket.IO");
    // console.log(socket.id + " has joined");

    socket.on('signin', (senderEmail) => {
      console.log(senderEmail);
      clients[senderEmail] = socket;
      console.log(clients);
    });

    socket.on("message", (msg) => {
      console.log(msg);
      const targetEmail = msg.targetEmail;
      if (clients[targetEmail]){
        clients[targetEmail].emit("message", msg);
        addMessage(msg.senderEmail,msg.targetEmail,msg.message)
      }
    });
  });
};

async function addMessage(senderEmail, targetEmail, message) {
  try {
    const sender = await User.findOne({ email: senderEmail });
    if (!sender) {
      throw new Error('Sender not found');
    }

    const targetChatIndex = sender.chats.findIndex(chat => chat.targetEmail === targetEmail);
    console.log(`targetchatindex ======> ${targetChatIndex}`)
    if (targetChatIndex !== -1) {
      // If the target chat already exists in the user's chats
      sender.chats[targetChatIndex].messages.push({
        text: message,
        type: 'sentMsg'
      });
      console.log('entered in true part of if else')
    } else {
      // If the target chat doesn't exist in the user's chats
      sender.chats.push({
        targetEmail: targetEmail,
        messages: [{
          text: message,
          type: 'sentMsg'
        }],
      });
    }

    await sender.save(); // Saved message for sender
    console.log('Message added for sender successfully');
  } catch (error) {
    console.error('Error adding message:', error.message);
  }
}

