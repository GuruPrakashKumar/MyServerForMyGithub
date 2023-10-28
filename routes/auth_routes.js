
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const jwtSecretKey = process.env.JWT_SECRET_KEY;
const otpGenerator = require("otp-generator");
const nodemailer = require('nodemailer')
const User = require('../models/user_models');
const userChatModel = require('../models/chat_model')
const DEFAULT_PROFILE_IMAGE = 'https://res.cloudinary.com/dvmjj1jwt/image/upload/v1698135020/default_dp.jpg'

function verifyToken(req, resp, next) {
  let token = req.headers['authorization'];
  if (token) {
    token = token.split(' ')[1];
    jwt.verify(token, jwtSecretKey, (err, authData) => {
      if (err) {
        resp.status(401).send({ message: "You are Unauthorized" });//token not valid
      } else {
        req.authData = authData;
        next();
      }
    });
  } else {
    resp.status(403).send({ message: "Token not found" });
  }
}
async function emailSender(otp, email) {
  const transporter = nodemailer.createTransport(
    {
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "guruprakash745@gmail.com",
        pass: "hltmiudyulczlhmx"
      }
    }
  );

  await transporter.sendMail({
    from: "guruprakash745@gmail.com",
    to: email,
    subject: "Email Verification",
    text: `Your OTP: ${otp}\n Don't Share this otp with anyone else.\nIf you have not generated this OTP you can safely ignore this.`
  });
}
router.post('/signUpInit', async (req, res) => {//email is required
  const email = req.body.email;
  const existingUser = await User.findOne({ email: req.body.email });
  const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
  const timestamp = Date.now()
  if (existingUser != null && existingUser.password != null) {
    res.status(409).json({ message: "Account already exists" });
  } else if (existingUser != null) {
    // User exists in database, update OTP and timestamp
    await existingUser.updateOne({ $set: { timestamp: timestamp, otp: otp } })
    // Sending OTP via email  //UNCOMMENT THESE LINES TO SEND THE OTP TO THE RESPECTIVE EMAIL
    await emailSender(otp,email)
    res.status(200).json({ message: "OTP sent to the user's email." })

  } else {
    // User doesn't exist in database, create a new user  
    const newUser = new User({
      email: email,
      otp: otp,
      timestamp: timestamp
    })
    await newUser.save()
    // Sending OTP via email  //UNCOMMENT THESE LINES TO SEND THE OTP TO THE RESPECTIVE EMAIL
    await emailSender(otp,email)
    res.status(200).json({ message: "OTP sent to the user's email." })

  }

})

router.post('/otpVerification', async (req, res) => {//email and otp required
  const savedUser = await User.findOne({ email: req.body.email })
  if (savedUser != null) {
    const savedOtp = savedUser.otp;
    if (savedOtp != req.body.otp) {//saved otp and user provided otp is not equal
      res.status(400).json({ message: "Incorrect OTP !!" })
    } else {
      const currentTimeStamp = Date.now()
      if ((currentTimeStamp - savedUser.timestamp) > 10 * 60 * 1000) {
        res.status(410).json({ message: "OTP has expired" })
      } else {
        await savedUser.updateOne({ $set: { verified: true, otp: null, timestamp: null } })
        jwt.sign({ email: savedUser.email }, jwtSecretKey, { expiresIn: "300s" }, (err, token) => {//TODO: change this expire time
          if (err) {
            res.status(500).json({ message: "Internal Server Error" });
          }
          res.status(200).json({ accessToken: token });
        });
      }
    }
  } else {
    res.status(404).json({ message: "User Not Found" })
  }
})

router.post('/signup', verifyToken, async (req, res) => {//name and pass required 
  try {
    const newUser = await User.findOne({ email: req.authData.email });
    if (newUser == null) {
      return res.status(404).json({ message: 'User Not Found' });
    } else if (newUser.verified == false) {
      return res.status(400).json({ message: 'User Not Verified' });
    } else if (newUser.password != null) {
      return res.status(409).json({ message: 'User already Exists' });
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    await newUser.updateOne({ $set: { name: req.body.name, password: hashedPassword, imgPath: DEFAULT_PROFILE_IMAGE } })


    //saving for chatModel also
    const newUserChatModel = new userChatModel({//TODO: see this
      name: req.body.name,
      email: newUser.email,
      imgPath: DEFAULT_PROFILE_IMAGE
    })
    await newUserChatModel.save();

    res.status(200).json({ message: "User Registered Succesfully" })
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.post('/signin', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email, });
    if (user == null || user.password == null) {
      res.status(404).json({ message: "User Not Found" })
    } else if (req.body.password == null) {
      res.status(401).json({ message: "Password Field is required" })
    } else {
      const passwordCompare = await bcrypt.compare(req.body.password, user.password)
      if (!passwordCompare) {
        console.log("Invalid password");
        res.status(401).json({ message: 'Invalid credentials' });
      } else {
        jwt.sign({ email: user.email }, jwtSecretKey, { expiresIn: "7d" }, (err, token) => {
          if (err) {
            res.status(500).json({ message: "Internal Server Error" });
          }
          res.status(200).json({ accessToken: token });
        });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.post('/forgotPassInit', async (req, res) => {
  const existingUser = await User.findOne({ email: req.body.email })
  if (existingUser != null && existingUser.password != null) {
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    const timestamp = Date.now()
    // emailSender(otp,timestamp)
    await existingUser.updateOne({ $set: { otp: otp, timestamp: timestamp } })
    res.status(200).json({ message: "OTP sent to the user's email" })
  } else {
    res.status(404).json({ message: "User Not Found" })
  }
})

//after otpVerification
router.post('/resetPassword', verifyToken, async (req, res) => {
  const email = req.authData.email;
  const newPassword = req.body.password;
  const savedUser = await User.findOne({ email: email })
  if (savedUser.password != null) {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)
    await savedUser.updateOne({ $set: { password: hashedPassword } })
    res.status(200).json({ message: "Password reset Successfully" })
  }else{
    res.status(400).json({ message: "You can not reset your password" })
  }
})

module.exports = {
  router,
  verifyToken
};