<template>
  <div class="canvas-wrapper">
    <div class="canvas-container">
      <canvas ref="canvas"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseout="stopDrawing">
      </canvas>
      <div class="countdown" v-if="!canPlaceTile">{{ getCountdownText() }}</div>
    </div>
    <div class="color-palette">
      <div v-for="(color, index) in colors"
        :key="index"
        :style="{ background: color }"
        @click="selectColor(index)"
        :class="{ 'selected': selectedColor === index }">
      </div>
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
      countdownTime: 0,
      canPlaceTile: true,
    };
  },
  methods: {
    startDrawing(event) {
      this.drawing = true;
      this.draw(event);
    },
    draw(event) {
      if (!this.drawing || !this.canPlaceTile) return;
      const rect = this.$refs.canvas.getBoundingClientRect();
      const canvasX = Math.floor((event.clientX - rect.left) / 10);
      const canvasY = Math.floor((event.clientY - rect.top) / 10);
      this.context.fillStyle = this.colors[this.selectedColor];
      this.context.fillRect(canvasX * 10, canvasY * 10, 10, 10);
      this.socket.emit("placeTile", { x: canvasX, y: canvasY, color: this.selectedColor });
      this.startTilePlacingCooldown();
    },
    stopDrawing() {
      this.drawing = false;
    },
    selectColor(index) {
      this.selectedColor = index;
    },
    startTilePlacingCooldown() {
      this.canPlaceTile = false;
      this.countdownTime = 5;
      const countdownInterval = setInterval(() => {
        if (this.countdownTime > 0) {
          this.countdownTime--;
        } else {
          clearInterval(countdownInterval);
          this.canPlaceTile = true;
        }
      }, 1000);
    },
    getCountdownText() {
      return `You can place another tile in: ${this.countdownTime} seconds`;
    },
  },
  mounted() {
    this.$refs.canvas.width = 500;
    this.$refs.canvas.height = 500;
    this.context = this.$refs.canvas.getContext("2d");
    this.socket = io("https://aidanthebandit-fluffy-disco-6pj96vg74rp2xq9q-3000.preview.app.github.dev");

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
body {
  margin: 0;
  padding: 0;
  background-color: #f2f2f2;
}

.canvas-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f2f2f2;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3);
}

.canvas-container {
  position: relative;
  max-width: 80%;
  max-height: 80%;
  border-radius: 10px;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
  border: 1px solid #ccc;
}

.color-palette {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.color-palette div {
  width: 20px;
  height: 20px;
  cursor: pointer;
  border-radius: 50%;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.3);
}

.color-palette div:hover {
  opacity: 0.8;
}

.color-palette div.selected {
  border: 3px solid white;
}

.countdown {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
}
</style>