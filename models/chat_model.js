const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userChatSchema = new Schema({
    name: String,
    email: String,
    imgPath: String,
    deviceToken: String,
    chats: [,
      {
        targetEmail: String,
        messages: [
          { type: String },
          { text: String }
        ]
      },
    ],
  },
    { versionKey: false }
  );


module.exports = mongoose.model('chats', userChatSchema);