const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');


class WebServer {
  constructor() {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.ioServer = new Server(this.httpServer);

    this.app.use(express.static(path.join(__dirname, 'public')));

    this.app.get('/', (req, res) => {
      res.sendFile(__dirname + '/client.html');
    });

    this.ioServer.on('connection', (socket) => {
      console.log('a user connected');
      socket.emit('message', Math.round(Math.random() * 1000));
    });

    this.httpServer.listen(8080, () => console.log(`Server listening on port 8080!`));
  }

  emit(message) {
    this.ioServer.emit('update', message)
  }
}

module.exports = new WebServer();