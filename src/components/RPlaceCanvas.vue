<template>
  <div>
    <canvas ref="canvas" @mousedown="startDrawing" @mousemove="draw" @mouseup="stopDrawing" @mouseout="stopDrawing"></canvas>
    <div class="color-palette">
      <div v-for="(color, index) in colors" :key="index" :style="{ background: color }" @click="selectColor(index)"></div>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";

export default {
  data() {
    return {
      drawing: false,
      context: null,
      selectedColor: 0,
      socket: null,
      colors: [
        "#FFFFFF", "#C1C1C1", "#EF130B", "#FF7100", "#FFE400", "#00CC00", "#00B2FF", "#231FD3",
        "#A300BA", "#D37CAA", "#A0522D", "#000000", "#4C4C4C", "#740B07", "#C23800", "#E8A200",
        "#005510", "#00569E", "#0E0865", "#550069", "#A75574", "#63300D",
      ],
    };
  },
  methods: {
    startDrawing(event) {
      this.drawing = true;
      this.draw(event);
    },
    draw(event) {
      if (!this.drawing) return;
      const rect = this.$refs.canvas.getBoundingClientRect();
      const canvasX = Math.floor((event.clientX - rect.left) / 10);
      const canvasY = Math.floor((event.clientY - rect.top) / 10);
      this.context.fillStyle = this.colors[this.selectedColor];
      this.context.fillRect(canvasX * 10, canvasY * 10, 10, 10);
      this.socket.emit("placeTile", { x: canvasX, y: canvasY, color: this.selectedColor });
    },
    stopDrawing() {
      this.drawing = false;
    },
    selectColor(index) {
      this.selectedColor = index;
    },
  },
  mounted() {
    this.$refs.canvas.width = 500;
    this.$refs.canvas.height = 500;
    this.context = this.$refs.canvas.getContext("2d");
    this.socket = io("https://aidanthebandit-potential-yodel-qjp776xp7pfx9qr-3000.preview.app.github.dev");

    this.socket.on("initialState", (data) => {
      data.forEach(({ x, y, color }) => {
        this.context.fillStyle = this.colors[color];
        this.context.fillRect(x * 10, y * 10, 10, 10);
      });
    });

    this.socket.on("tilePlaced", ({ x, y, color }) => {
      this.context.fillStyle = this.colors[color];
      this.context.fillRect(x * 10, y * 10, 10, 10);
    });
  },
};
</script>

<style>
.color-palette {
  display: flex;
  flex-wrap: wrap;
  width: 100px;
  margin-top: 10px;
}

.color-palette div {
  width: 10px;
  height: 10px;
  cursor: pointer;
  border: 1px solid #ccc;
}
</style>
