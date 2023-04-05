import { createApp } from "vue";
import App from "./App.vue";
import io from "socket.io-client";

const socket = io("https://aidanthebandit-potential-yodel-qjp776xp7pfx9qr-3000.preview.app.github.dev");

const app = createApp(App);
app.provide("socket", socket);
app.mount("#app");
