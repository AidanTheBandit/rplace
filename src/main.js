import { createApp } from "vue";
import App from "./App.vue";
import io from "socket.io-client";
import './main.css';


const socket = io("https://dumb-event.bndt.cloud:3000");

const app = createApp(App);
app.provide("socket", socket);
app.mount("#app");
