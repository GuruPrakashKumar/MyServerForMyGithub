const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSocketSchema = new Schema({
    email: String,
  },
    { versionKey: false }
  );


module.exports = mongoose.model('sockets', userSocketSchema);