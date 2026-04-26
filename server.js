const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('new-pin', (pin) => {
    io.emit('pin-added', pin);
  });

  socket.on('disconnect', () => {
    console.log('a user disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
