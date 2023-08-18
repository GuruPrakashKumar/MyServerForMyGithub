const express = require('express');
const router = express.Router();
const User = require('../models/user_models'); //this returns a model of 'students' collection so that data can be set in this and posted.
const BlogModel = require('../models/blog_model')
// const {verifyToken} = require('./auth_routes');
const authRoutes = require('./auth_routes'); 
const cloudinary = require('./cloudinary_config')


const DEFAULT_PROFILE_IMAGE = 'https://res.cloudinary.com/dvmjj1jwt/image/upload/v1691922615/default_img_ormosn.png'
const { extractPublicId } = require('cloudinary-build-url');//used in image uploading to delete previous profile pic from cloudinary




module.exports = {cloudinary};




router.get('/getProfilePhoto',  authRoutes.verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.authData.user.email,
    })
    if (user) {//also have to handle if user has not uploaded any profile photo

      res.status(200).json(user.imgPath)
    } else {
      res.json({ message: "user not found" })
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
})





router.post('/imgupload',  authRoutes.verifyToken, async (req, res) => {//this is for profile photo uploading
  try {
    // const emailId = req.body.email; 
    // console.log(req)
    const emailId = req.authData.user.email;
    const file = req.files.photo;
    const previousProfilePhotoPath = req.authData.user.imgPath;

    cloudinary.uploader.upload(file.tempFilePath, {
      transformation: [
        { quality: 'auto:low' },
      ],
    }, async (err, resp) => {
      if (err) {
        console.error(err);
        return res.status(500).json(err);
      }

      const imagePath = resp.url;

      await User.updateOne({ email: emailId }, { $set: { imgPath: imagePath } }, { upsert: true });
      await BlogModel.updateMany({ email: emailId }, { $set: { imgPath: imagePath } },);

      if (previousProfilePhotoPath != DEFAULT_PROFILE_IMAGE) {
        const previousPublicId = extractPublicId(previousProfilePhotoPath)
        cloudinary.uploader.destroy(previousPublicId, (deleteErr, deleteResp) => {
          if (deleteErr) {
            console.error(deleteErr);
          }
          console.log(`Previous image with public ID ${previousPublicId} deleted`);
        });
      }

      res.status(200).json({ imagePath });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});


module.exports = router;
