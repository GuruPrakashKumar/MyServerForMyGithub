// const express = require('express');
// const app = express();
// const port = 8080 || process.env.PORT;
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// const fileUpload = require('express-fileupload');
// require('dotenv').config();
// const mongodbAtlasDatabaseUrl = process.env.MONGODB_ATLAS_DATABASE_LINK;
// const http = require('http')
// const server = http.createServer(app)
// const io = require("socket.io")(server)
// mongoose.connect(mongodbAtlasDatabaseUrl, { useNewUrlParser: true, useUnifiedTopology: true });
// var clients = {};//saves the all clients data which are connected to socketio server
// io.on('connection',(socket)=>{
//   console.log("connected to io")
//   console.log(socket.id+"has joined")
//   socket.on('signin',(id)=>{
//     console.log(id);
//     clients[id] = socket
//     console.log(clients)
//   })
//   socket.on("message",(msg)=>{
//     console.log(msg)
//     let targetId = msg.targetId
//     if(clients[targetId]) clients[targetId].emit("message",msg)
//   })
// })


// app.use(fileUpload({ useTempFiles: true }));//for image file uploading
// app.use(express.json());
// app.use(cors());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());


// const authRoutes = require('./routes/auth_routes');
// const blogsRoutes = require('./routes/blogs_routes');
// const userRoutes = require('./routes/user_routes');

// app.use('/', authRoutes.router);
// app.use('/', blogsRoutes);
// app.use('/', userRoutes);

// server.listen(port,'0.0.0.0',()=>{
//   console.log("server connected to socket io")
// })



const express = require('express');
const app = express();
const port = 8080 || process.env.PORT;
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const mongodbAtlasDatabaseUrl = process.env.MONGODB_ATLAS_DATABASE_LINK;
const http = require('http')
const server = http.createServer(app)
const io = require("socket.io")(server)

const socketController = require('./controllers/socketController');
socketController(io);

mongoose.connect(mongodbAtlasDatabaseUrl, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const routesController = require('./controllers/routesController');
app.use('/', routesController);

server.listen(port, '0.0.0.0', () => {
  console.log("Server connected to Socket.IO");
});
