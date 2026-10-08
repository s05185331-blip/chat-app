const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const onlineUsers = {};

io.on('connection', (socket) => {
  console.log('یک کاربر متصل شد:', socket.id);

  socket.on('join', (username) => {
    onlineUsers[socket.id] = username;
    socket.username = username;
    io.emit('userList', Object.values(onlineUsers));
    socket.broadcast.emit('systemMessage', `${username} به چت پیوست`);
  });

  socket.on('chatMessage', (msg) => {
    io.emit('chatMessage', {
      username: socket.username || 'ناشناس',
      text: msg,
      time: new Date().toLocaleTimeString('fa-IR')
    });
  });

  socket.on('typing', () => {
    socket.broadcast.emit('typing', socket.username);
  });
  socket.on('stopTyping', () => {
    socket.broadcast.emit('stopTyping');
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      delete onlineUsers[socket.id];
      io.emit('userList', Object.values(onlineUsers));
      io.emit('systemMessage', `${socket.username} از چت خارج شد`);
    }
    console.log('کاربر قطع شد:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`سرور در حال اجرا روی http://localhost:${PORT}`);
});