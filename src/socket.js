// socket.js
import io from "socket.io-client";

let socket;

export async function createSocket() {
  //socket = io("https://aidanthebandit-fluffy-disco-6pj96vg74rp2xq9q-3000.preview.app.github.dev");
  socket = io("/api");
}

export { socket };
