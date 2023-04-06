// socket.js
import io from "socket.io-client";

let socket;

export async function createSocket() {
  socket = io("https://aidanthebandit-potential-yodel-qjp776xp7pfx9qr-3000.preview.app.github.dev");
}

export { socket };
