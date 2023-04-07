const { Server } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.LINODE_ACCESS_KEY,
  secretAccessKey: process.env.LINODE_SECRET_KEY,
  endpoint: process.env.LINODE_ENDPOINT,
  s3ForcePathStyle: true,
});

const BUCKET = process.env.LINODE_BUCKET;
const KEY = 'my-place.db';

const io = new Server({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

async function downloadDatabaseFromStorage() {
  try {
    const data = await s3
      .getObject({
        Bucket: BUCKET,
        Key: KEY,
      })
      .promise();

    return data.Body;
  } catch (error) {
    console.error('Error downloading the database from Linode Object Storage:', error);
    return null;
  }
}

async function uploadDatabaseToStorage(buffer) {
  try {
    await s3
      .putObject({
        Bucket: BUCKET,
        Key: KEY,
        Body: buffer,
      })
      .promise();
  } catch (error) {
    console.error('Error uploading the database to Linode Object Storage:', error);
  }
}

const db = new sqlite3.Database(':memory:', async (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the in-memory SQLite database.');

    const buffer = await downloadDatabaseFromStorage();
    if (buffer) {
      db.exec(buffer.toString(), (err) => {
        if (err) {
          console.error('Error loading the database from Linode Object Storage:', err);
        } else {
          console.log('Loaded the database from Linode Object Storage.');
        }
      });
    }
  }
});

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS tiles (x INTEGER, y INTEGER, color INTEGER, PRIMARY KEY (x, y))');
});

io.on('connection', (socket) => {
  console.log('New client connected');

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

    db.run('INSERT OR REPLACE INTO tiles (x, y, color) VALUES (?, ?, ?)', [x, y, color], (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`Tile placed at (${x}, ${y}) with color ${color} saved to the database`);

        io.emit('tilePlaced', { x, y, color });
        console.log('Emitted tilePlaced event to all clients');

        syncDatabaseToStorage();
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

async function syncDatabaseToStorage() {
  db.serialize(() => {
    db.all('SELECT * FROM tiles', async (err, rows) => {
      if (err) {
        console.error(err.message);
      } else {
        const buffer = Buffer.from(JSON.stringify(rows));
        await uploadDatabaseToStorage(buffer);
      }
    });
  });
}

module.exports = (req, res) => {
  io.attach(req.socket);
  res.setHeader('Connection', 'upgrade');
  res.setHeader('Upgrade', 'websocket');
  res.statusCode = 101;
  res.end();
};
