const clients = {};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log("Connected to Socket.IO");
    console.log(socket.id + " has joined");

    socket.on('signin', (id) => {
      console.log(id);
      clients[id] = socket;
      console.log(clients);
    });

    socket.on("message", (msg) => {
      console.log(msg);
      const targetId = msg.targetId;
      if (clients[targetId]) clients[targetId].emit("message", msg);
    });
  });
};
