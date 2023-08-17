const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const imgSchema = new Schema({
    name:String,
    imgPath: String
})

module.exports = mongoose.model('images',imgSchema);
