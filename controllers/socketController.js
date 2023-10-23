const clients = {};
// const User = require('../models/user_models');
const userChatModel = require('../models/chat_model')
const userSocketModel = require('../models/socket_model')



module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log("Connected to Socket.IO");
    console.log(socket.id + " has joined");

    socket.on('signin', (senderEmail) => {
      // console.log(`sender uid is ${senderEmail}`);
      // clients[senderEmail] = senderEmail;
      // console.log(`clients is ${clients}`);
      socket.join(senderEmail)
      //save uid to database
    });

    socket.on("message", (msg) => {
      console.log(`msg is ${msg}`);
      const targetEmail = msg.targetEmail;
      console.log(`target email is ${targetEmail}`)

      if (msg.targetEmail){
        console.log('executing line 27')
        io.to(targetEmail).emit("message", msg);
        addMessage(msg.senderEmail,msg.targetEmail,msg.message)
      }
    });

    // socket.on("disconnect",async (id)=>{
    //   console.log(`${id} disconnected from socket`)
    // })
  });
};

async function addMessage(senderEmail, targetEmail, message) {
  try {
    const sender = await userChatModel.findOne({ email: senderEmail });
    if (!sender) {
      throw new Error('Sender not found in database');
    }

    const targetChatIndex = sender.chats.findIndex(chat => chat.targetEmail === targetEmail);
    // console.log(`targetchatindex ======> ${targetChatIndex}`)
    if (targetChatIndex !== -1) {
      // If the target chat already exists in the user's chats
      sender.chats[targetChatIndex].messages.push({
        text: message,
        type: 'sentMsg'
      });
      
      sender.markModified('chats');
      
      await sender.save(); // Saved message for sender
      console.log('entered in true part of if else')
      console.log(sender.chats[targetChatIndex].messages)
    } else {
      // If the target chat doesn't exist in the user's chats
      sender.chats.push({
        targetEmail: targetEmail,
        messages: [{
          text: message,
          type: 'sentMsg'
        }],
      });
      await sender.save(); // Saved message for sender
    }
    console.log('Message added for sender successfully');
    
    
    
    
    const receiver = await userChatModel.findOne({email: targetEmail});
    if(!receiver){
      throw new Error('receiver not found in database');
    }
    const senderChatIndexForTargetDatabase = receiver.chats.findIndex(chat=> chat.targetEmail === senderEmail);
    console.log(`senderChatIndexForTargetDatabase ======> ${senderChatIndexForTargetDatabase}`)
    if(senderChatIndexForTargetDatabase !== -1){
      receiver.chats[senderChatIndexForTargetDatabase].messages.push({
        text: message,
        type: 'receivedMsg'
      });

      receiver.markModified('chats');

      await receiver.save();//saved msg for target also
    }else{
      receiver.chats.push({
        targetEmail: senderEmail,
        messages:[{
          text:message,
          type:'receivedMsg',
        }],
      })
      await receiver.save();//saved msg for target also
    }
    console.log('message added for target successfully')
  } catch (error) {
    console.error('Error adding message:', error.message);
  }
}

