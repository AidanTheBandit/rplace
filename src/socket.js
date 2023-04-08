// socket.js
import io from "socket.io-client";

let socket;

export async function createSocket() {
  socket = io("https://place-event.bndt.cloud");
  //socket = io("/api");
}

export { socket };
