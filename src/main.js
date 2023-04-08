import { createApp } from "vue";
import App from "./App.vue";
import io from "socket.io-client";
import './main.css';


const socket = io("https://place-event.bndt.cloud");

const app = createApp(App);
app.provide("socket", socket);
app.mount("#app");
