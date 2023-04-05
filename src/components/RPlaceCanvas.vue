<template>
  <div>
    <canvas ref="canvas" @click="onClick" class="r-place-canvas"></canvas>
  </div>
</template>

<script>
import { inject } from "vue";

export default {
  name: "RPlaceCanvas",
  data() {
    return {
      canvas: null,
      ctx: null
    };
  },
  setup() {
    const socket = inject("socket");
    return {
      socket,
    };
  },
  mounted() {
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = 50;
    this.canvas.height = 50;
    this.canvas.style.width = "500px";
    this.canvas.style.height = "500px";
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.socket.on("tiles", (tiles) => {
      this.drawTiles(tiles);
    });

    this.socket.emit("requestTiles");
  },
  methods: {
    onClick(event) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const x = Math.floor((event.clientX - rect.left) * scaleX);
      const y = Math.floor((event.clientY - rect.top) * scaleY);
      const color = Math.floor(Math.random() * 16);

      this.socket.emit("updateTile", { x, y, color });
    },
    drawTiles(tiles) {
      for (const tile of tiles) {
        this.ctx.fillStyle = tile.color;
        this.ctx.fillRect(tile.x, tile.y, 1, 1);
      }
    },
  },
};
</script>

<style scoped>
.r-place-canvas {
  border: 1px solid black;
}
</style>
