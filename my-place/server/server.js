const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
  },
});

const db = new sqlite3.Database('my-place.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    db.run(`CREATE TABLE IF NOT EXISTS tiles (
            x INTEGER NOT NULL,
            y INTEGER NOT NULL,
            color INTEGER NOT NULL,
            PRIMARY KEY (x, y)
        )`);
  }
});

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('update tile', (x, y, color) => {
    db.run('INSERT OR REPLACE INTO tiles (x, y, color) VALUES (?, ?, ?)', [x, y, color]);
    socket.broadcast.emit('tile updated', x, y, color);
  });

  db.all('SELECT x, y, color FROM tiles', [], (err, rows) => {
    if (err) {
      throw err;
    }
    socket.emit('init tiles', rows);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
