
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const jwtSecretKey = process.env.JWT_SECRET_KEY;

const User = require('../models/user_models');
const userChatModel = require('../models/chat_model')


function verifyToken(req, resp, next) {
  let token = req.headers['authorization'];
  if (token) {
    token = token.split(' ')[1];
    jwt.verify(token, jwtSecretKey, (err, authData) => {
      if (err) {
        resp.status(401).send({ result: "token not valid" });
      } else {
        req.authData = authData;
        next();
      }
    });
  } else {
    resp.status(403).send({ result: "token not found. please add token" });
  }
}


router.post('/signup', async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.json({
        message: 'Email is not available',
      });
    }

    const newUser = new User({//made this 'students' model
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      imgPath: req.body.imgPath
    });

    await newUser.save();
    // console.log(newUser);

    //saving for chatModel also
    const newUserChatModel = new userChatModel({
      name: req.body.name,
      email: req.body.email,
      imgPath: req.body.imgPath
    })
    await newUserChatModel.save();

    res.status(200).json(newUser);
    // res.send(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.post('/signin', async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });

    if (user) {

      const passwordCompare = await bcrypt.compare(req.body.password, user.password)

      if (!passwordCompare) {
        console.log("Invalid password");
        res.json({ message: 'Invalid credentials' });
      } else {
        jwt.sign({ user }, jwtSecretKey, { expiresIn: "2h" }, (err, token) => {
          if (err) {
            res.send({ result: "something went wrong" });
          }
          res.json({ user, auth: token });
        });
      }
    } else {
      console.log("user not found");
      res.json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});


module.exports = {
  router,
  verifyToken
};