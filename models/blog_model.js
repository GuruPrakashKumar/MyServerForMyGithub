const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BlogModel = new Schema({
    email:String,
    name:String,
    blog:String,
    imgPath:String,//for profile photo
    blogImagePath:String,//for blog image if any
    likes:{
        type:Number,
        default:0,
    },
    dislikes:{
        type:Number,
        default:0,
    },
})

module.exports = mongoose.model('blogs',BlogModel);