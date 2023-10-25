// blogs_routes.js
const express = require('express');
const router = express.Router();
const BlogModel = require('../models/blog_model');
const User = require('../models/user_models');
// const {verifyToken} = require('./auth_routes');
const authRoutes = require('./auth_routes');
const cloudinary = require('./cloudinary_config')
const axios = require('axios')

router.post('/correct-grammar', authRoutes.verifyToken, async (req, res) => {
  const inputText = req.body.blog;
  const inputTokens = inputText.split(' ').length;//gpt-3.5-turbo-instruct
  const response = await axios.post('https://api.openai.com/v1/engines/text-davinci-002/completions', {
    prompt: `Correct the following paragraph of sentences: "${inputText}"`,
    max_tokens: inputTokens + 100,
    temperature: 0.3,
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPEN_API_KEY}`,
      // 'Authorization': `Bearer ${req.body.apiKey}`,
    },
  },)
  const correctedText = response.data.choices[0].text;
  if (correctedText) {
    res.status(200).json({ message: correctedText });
  }
})

// Like Blog Route
router.post('/likeBlog', authRoutes.verifyToken, async (req, res) => {
  try {
    const blogId = req.body.blogId;
    // const likeStatus = req.body.likeStatus;

    if (!blogId) {
      return res.status(400).json({ message: 'Blog ID is required' });
    }

    const likedBlog = await BlogModel.findOne({ _id: blogId });
    if (!likedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const userLiked = await User.findOne({ email: req.authData.email });
    if (!userLiked) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userLiked.dislikedPosts.includes(blogId)) {
      await userLiked.updateOne({ $pull: { dislikedPosts: blogId } });
      await userLiked.updateOne({ $push: { likedPosts: blogId } });
      await likedBlog.updateOne({ $inc: { dislikes: -1, likes: 1 } });
      res.status(200).json({ message: 'Blog undisliked and liked successfully' });
    } else if (userLiked.likedPosts.includes(blogId)) {
      await userLiked.updateOne({ $pull: { likedPosts: blogId } });
      await likedBlog.updateOne({ $inc: { likes: -1 } });
      res.status(200).json({ message: 'Blog unliked successfully' });
    } else {
      await userLiked.updateOne({ $push: { likedPosts: blogId } });
      await likedBlog.updateOne({ $inc: { likes: 1 } });
      res.status(200).json({ message: 'Blog liked successfully' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Dislike Blog Route
router.post('/dislikeBlog', authRoutes.verifyToken, async (req, res) => {
  try {
    const blogId = req.body.blogId;
    if (!blogId) {
      return res.status(400).json({ message: 'Blog ID is required' });
    }
    const disLikedBlog = await BlogModel.findOne({ _id: blogId });
    if (!disLikedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    const userDisliked = await User.findOne({ email: req.authData.email });
    if (!userDisliked) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userDisliked.likedPosts.includes(blogId)) {
      await userDisliked.updateOne({ $pull: { likedPosts: blogId } });//note for me before i was trying pull push together but didn't work now working
      await userDisliked.updateOne({ $push: { dislikedPosts: blogId } });

      await disLikedBlog.updateOne({ $inc: { likes: -1, dislikes: 1 } });

      res.status(200).json({ message: 'Blog unliked and disliked successfully' });
    } else if (userDisliked.dislikedPosts.includes(blogId)) {
      await userDisliked.updateOne({ $pull: { dislikedPosts: blogId } });
      await disLikedBlog.updateOne({ $inc: { dislikes: -1 } });
      res.status(200).json({ message: 'Blog unDisliked successfully' });
    } else {
      await userDisliked.updateOne({ $push: { dislikedPosts: blogId } });
      await disLikedBlog.updateOne({ $inc: { dislikes: 1 } });
      res.status(200).json({ message: 'Blog disliked successfully' });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get All Blogs Route
// router.get('/getAllBlogs', authRoutes.verifyToken, async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const pageSize = parseInt(req.query.pageSize) || 10;
//     const skip = (page - 1) * pageSize;

//     const totalBlogCount = await BlogModel.countDocuments();
//     const totalPages = Math.ceil(totalBlogCount / pageSize);
//     const allBlogs = await BlogModel.find({}, {
//       _id: 1,
//       name: 1,
//       blog: 1,
//       imgPath: 1,
//       blogImagePath: 1,
//       likes: 1, dislikes: 1,
//       datePublished: 1
//     })
//       .sort({datePublished: -1})
//       .skip(skip)
//       .limit(pageSize);
//     const user = await User.find({ email: req.authData.email }, { likedPosts: 1, dislikedPosts: 1 })
//     var blogsWithLikeStatus = allBlogs.map(blog => {
//       const isLiked = user[0].likedPosts.includes(blog._id);
//       const isDisliked = user[0].dislikedPosts.includes(blog._id);

//       return {
//         ...blog._doc,//note for me: it adds isLiked and isDisliked in the objects of the blogs
//         isLiked,
//         isDisliked
//       };
//     });
//     // const next = skip + limit < totalBlogCount;
//     const paginationInfo = {
//       totalBlogs: totalBlogCount,
//       totalPages,
//       currentPage: page,
//     };

//     // Prepare links to next and previous pages
//     if (page < totalPages) {
//       paginationInfo.next = { page: page + 1 };
//     }
//     if (page > 1) {
//       paginationInfo.previous = { page: page - 1 };
//     }

//     // console.log('blogs with like status: ')
//     // console.log(blogsWithLikeStatus);
//     // console.log('total response: ')
//     res.status(200).json({blogs: blogsWithLikeStatus, pagination: paginationInfo});
//   } catch (err) {
//     console.error(err);
//     res.status(500).json(err);
//   }
// });
router.get('/getAllBlogs', authRoutes.verifyToken, async (req, res) => {
  try {
    const allBlogs = await BlogModel.find({}, { _id: 1, name: 1, blog: 1, imgPath: 1, blogImagePath: 1, likes: 1, dislikes: 1, datePublished: 1 });
    const user = await User.find({ email: req.authData.email }, { likedPosts: 1, dislikedPosts: 1 })
    var blogsWithLikeStatus = allBlogs.map(blog => {
      const isLiked = user[0].likedPosts.includes(blog._id);
      const isDisliked = user[0].dislikedPosts.includes(blog._id);

      return {
        ...blog._doc,//note for me: it adds isLiked and isDisliked in the objects of the blogs
        isLiked,
        isDisliked
      };
    });

    // console.log('blogs with like status: ')
    // console.log(blogsWithLikeStatus);
    // console.log('total response: ')
    res.status(200).json(blogsWithLikeStatus.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.post('/blog', authRoutes.verifyToken, async (req, res) => {//for uploading blog
  try {
    if (req.files) {//if user will provide image for the blog
      const file = req.files.image; // coming from frontend
      cloudinary.uploader.upload(file.tempFilePath, {
        transformation: [
          { quality: 'auto:low' },
        ],
      }, async (err, resp) => {
        if (err) {
          console.error(err);
          return res.status(500).json(err);
        }
        const user = await User.findOne({ email: req.authData.email })
        const blogModel = new BlogModel({
          email: req.authData.email,
          name: user.name,
          blog: req.body.blog,
          imgPath: user.imgPath,
          blogImagePath: resp.url,
          datePublished: new Date(Date.now()).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }),
        });

        await blogModel.save();
        console.log(blogModel);
        res.status(200).json(blogModel);
      });
    } else {
      // No image provided, saving only blog content
      const user = await User.findOne({ email: req.authData.email })
      const blogModel = new BlogModel({
        email: req.authData.email,
        name: user.name,
        blog: req.body.blog,
        imgPath: user.imgPath,
        blogImagePath: "null",
        datePublished: new Date(Date.now()).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }),
      });

      await blogModel.save();
      console.log(blogModel);
      res.status(200).json(blogModel);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});


module.exports = router;
