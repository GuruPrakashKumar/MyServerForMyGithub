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

    const targetChatInSenderDatabase = sender.chats.find(chat => chat.targetEmail === targetEmail);
    if (targetChatInSenderDatabase) {
      //if the email id of the target is not present in the user's chat database
      targetChatInSenderDatabase.messages.push({
        type:'sentMsg',
        text:message
      });
    } else {
      //if the email id of the target is present in the user's chat database
      sender.chats.push({
        targetEmail: targetEmail,
        messages: {
          type:'sentMsg',
          text:message
        },
      });
    }

    await sender.save();//saved msg for sender
    console.log('Message added for sender successfully');


  } catch (error) {
    console.error('Error adding message:', error.message);
  }
}
