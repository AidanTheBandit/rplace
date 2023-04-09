const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const sqlite3 = require('sqlite3').verbose();

const app = express();

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const db = new sqlite3.Database('my-place.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the my-place database.');
  }
});

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS tiles (x INTEGER, y INTEGER, color INTEGER, PRIMARY KEY (x, y))');
});

io.on('connection', (socket) => {
  console.log('New client connected');

  // Send the initial state
  db.all('SELECT * FROM tiles', (err, rows) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Sending initial state:', rows);
      socket.emit('initialState', rows);
    }
  });

  socket.on('placeTile', (data) => {
    const { x, y, color } = data;
    console.log(`Received tile placed request at (${x}, ${y}) with color ${color}`);

    // Update the tile in the database
    db.run('INSERT OR REPLACE INTO tiles (x, y, color) VALUES (?, ?, ?)', [x, y, color], (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`Tile placed at (${x}, ${y}) with color ${color} saved to the database`);

        // Emit the update to all clients
        io.emit('tilePlaced', { x, y, color });
        console.log('Emitted tilePlaced event to all clients');
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
