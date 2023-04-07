// socket.js
import io from "socket.io-client";

let socket;

export async function createSocket() {
  socket = io("https://dumb-event.bndt.cloud:3000");
  //socket = io("/api");
}

export { socket };
