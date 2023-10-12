const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const circleSchema = new Schema({
    name: String,
    members: [{ email:String }]
    //i think that i should add also blogids related to the circle so that the blogs can be fetched faster
    // if we will find from all the blogs(searching via the circle id) then it will search all the blogs, hence it will be a slower approach

    //but for this i have to add also a logic that those blogs related to circle will not be shown publicly (may be a private field)
});

module.exports = mongoose.model('circles', circleSchema);