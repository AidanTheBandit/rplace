// socket.js
import io from "socket.io-client";

let socket;

export async function createSocket() {
  socket = io("http://3.83.167.70:3000");
  //socket = io("/api");
}

export { socket };
