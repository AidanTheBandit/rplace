<template>
  <div class="canvas-wrapper">
    <div class="canvas-container">
      <canvas ref="canvas"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseout="stopDrawing"
        @touchstart="startDrawingTouch"
        @touchmove="drawTouch"
        @touchend="stopDrawing">
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
import panzoom from "panzoom";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function setCookie(name, value, days = 30) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}${expires}; path=/`;
}

export default {
  data() {
    return {
      drawing: false,
      context: null,
      selectedColor: 0,
      socket: null,
      panzoomInstance: null,
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
      if (!this.canPlaceTile) return;
      this.drawing = true;
      this.draw(event);
    },
    draw(event) {
      if (!this.drawing || !this.canPlaceTile) return;
      const { x, y } = this.getCanvasCoordinates(event);
      this.context.fillStyle = this.colors[this.selectedColor];
      this.context.fillRect(x * 10, y * 10, 10, 10);
      this.socket.emit("placeTile", { x, y, color: this.selectedColor });
      this.startTilePlacingCooldown();
    },
    stopDrawing() {
      this.drawing = false;
    },
    startDrawingTouch(event) {
      if (!this.canPlaceTile) return;
      event.preventDefault();
      this.startDrawing(event.touches[0]);
    },
    drawTouch(event) {
      if (!this.canPlaceTile) return;
      event.preventDefault();
      this.draw(event.touches[0]);
    },
    selectColor(index) {
      this.selectedColor = index;
    },
    startTilePlacingCooldown() {
      this.canPlaceTile = false;
      this.countdownTime = 5;
      const cooldownEndTime = Date.now() + this.countdownTime * 1000;
      setLocalStorageValue("cooldownEndTime", cooldownEndTime);
      const countdownInterval = setInterval(() => {
        const remainingTime = Math.floor((cooldownEndTime - Date.now()) / 1000);
        if (remainingTime >= 0) {
          this.countdownTime = remainingTime;
        } else {
          clearInterval(countdownInterval);
          this.canPlaceTile = true;
        }
      }, 1000);
    },
    getCountdownText() {
      return `You can place another tile in: ${this.countdownTime} seconds`;
    },
    getCanvasCoordinates(event) {
      const rect = this.$refs.canvas.getBoundingClientRect();
      const scale = this.panzoomInstance.getTransform().scale;
      const offsetX = (event.clientX - rect.left) / scale;
      const offsetY = (event.clientY - rect.top) / scale;
      const x = Math.floor(offsetX / 10);
      const y = Math.floor(offsetY / 10);
      return { x, y };
    },
  },
  mounted() {
    this.$refs.canvas.width = 700;
    this.$refs.canvas.height = 700;
    this.context = this.$refs.canvas.getContext("2d");
    this.socket = io("https://place-event.bndt.cloud");

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

    // Initialize panzoom
    this.panzoomInstance = panzoom(this.$refs.canvas, {
      maxZoom: 2,
      minZoom: 0.5,
      bounds: true,
      boundsPadding: 0.1,
      onStateChange: () => {
        this.$refs.canvas.style.width = 500 * this.panzoomInstance.getTransform().scale + 'px';
        this.$refs.canvas.style.height = 500 * this.panzoomInstance.getTransform().scale + 'px';
      },
    });

    const storedCooldownEndTime = parseInt(getLocalStorageValue("cooldownEndTime"), 10);
    if (storedCooldownEndTime && !isNaN(storedCooldownEndTime) && storedCooldownEndTime > Date.now()) {
      this.countdownTime = Math.floor((storedCooldownEndTime - Date.now()) / 1000);
      this.startTilePlacingCooldown();
    }
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
  padding: 20px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3);
}

canvas {
  cursor: crosshair;
  border: 1px solid #ccc;
}

.color-palette {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
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
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 15px;
}

.zoom-buttons {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.zoom-button {
  width: 40px;
  height: 40px;
  background-color: #e84d83;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 50%;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.3);
}

.zoom-button:hover {
  opacity: 0.8;
}
</style>
