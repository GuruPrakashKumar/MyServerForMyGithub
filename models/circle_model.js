const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const circleSchema = new Schema({
    name: String,
    members: [{ email:String }]
});

module.exports = mongoose.model('circles', circleSchema);