import { createApp } from "vue";
import App from "./App.vue";
import io from "socket.io-client";
import './main.css';


const socket = io("https://aidanthebandit-fluffy-disco-6pj96vg74rp2xq9q-3000.preview.app.github.dev");

const app = createApp(App);
app.provide("socket", socket);
app.mount("#app");
