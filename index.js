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
