const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const newSchema = new Schema({
  name: String,
  email: String,
  password: String,
  imgPath: String,
  likedPosts: [Schema.Types.ObjectId],
  dislikedPosts: [Schema.Types.ObjectId],
  
},
  { versionKey: false }
);

newSchema.pre('save', async function (next) {
  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.password, salt)
    this.password = hashedPassword
    next()
    // const hashedPassword
  } catch (err) {
    next(err)
  }
})


module.exports = mongoose.model('students', newSchema);

