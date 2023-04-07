import { createApp } from "vue";
import App from "./App.vue";
import io from "socket.io-client";
import './main.css';


const socket = io("http://3.83.167.70:3000");

const app = createApp(App);
app.provide("socket", socket);
app.mount("#app");
