const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const authRoutes = require('../routes/auth_routes');
const blogsRoutes = require('../routes/blogs_routes');
const userRoutes = require('../routes/user_routes');
const chatRoutes = require('../routes/chat_routes')

router.use(fileUpload({ useTempFiles: true })); // for image file uploading
router.use(express.json());

router.use('/', authRoutes.router);
router.use('/', blogsRoutes);
router.use('/', userRoutes);
router.use('/',chatRoutes)

module.exports = router;
