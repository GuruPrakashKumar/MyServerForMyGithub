const express = require('express');
const app = express();
const port = process.env.PORT || 8001;
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const mongodbAtlasDatabaseUrl = process.env.MONGODB_ATLAS_DATABASE_LINK;
const http = require('http')
const server = http.createServer(app)
const io = require("socket.io")(server)
const pingInterval = 1 * 60 * 1000; // 1 minutes
const socketController = require('./controllers/socketController');
socketController(io);

mongoose.connect(mongodbAtlasDatabaseUrl, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const routesController = require('./controllers/routesController');
app.use('/', routesController);

//to keep server alive
const pingSelf = async () => {
  try {
    await axios.get(`${process.env.SERVER_URL}/health-check`);
    // await axios.get('http://localhost:8000/health-check');
  } catch (error) {
    console.error('Self-ping failed:', error.message);
  }
};

// Start the interval
setInterval(pingSelf, pingInterval);

app.get('/health-check', (req, res) => {
  res.status(200).send('OK');
});

server.listen(port, '0.0.0.0', () => {
  console.log("Server connected to Socket.IO");
});


