const express = require('express');
const app = express();
const port = 8080 || process.env.PORT;
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');


mongoose.connect("mongodb+srv://guruprakash745:25nI99xmD2q3ZuJX@cluster0.pxswliq.mongodb.net/GuruDatabase?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

app.use(fileUpload({ useTempFiles: true }));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Import and use your route files
const authRoutes = require('./routes/auth_routes');
const blogsRoutes = require('./routes/blogs_routes');
const userRoutes = require('./routes/user_routes');

app.use('/', authRoutes.router);
app.use('/', blogsRoutes);
app.use('/', userRoutes);

app.listen(port, () => {
  console.log('port running on ' + port);
});
