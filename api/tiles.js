const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const io = new Server({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', async (socket) => {
  console.log('New client connected');

  // Send the initial state
  const { data, error } = await supabase.from('tiles').select('*');

  if (error) {
    console.error(error.message);
  } else {
    console.log('Sending initial state:', data);
    socket.emit('initialState', data);
  }

  socket.on('placeTile', async (data) => {
    const { x, y, color } = data;
    console.log(`Received tile placed request at (${x}, ${y}) with color ${color}`);

    // Update the tile in the database
    const { error: updateError } = await supabase
      .from('tiles')
      .insert([{ x, y, color }], { upsert: true });

    if (updateError) {
      console.error(updateError.message);
    } else {
      console.log(`Tile placed at (${x}, ${y}) with color ${color} saved to the database`);

      // Emit the update to all clients
      io.emit('tilePlaced', { x, y, color });
      console.log('Emitted tilePlaced event to all clients');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

module.exports = (req, res) => {
  io.attach(req.socket);
  res.setHeader('Connection', 'upgrade');
  res.setHeader('Upgrade', 'websocket');
  res.statusCode = 101;
  res.end();
};
