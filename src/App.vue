<template>
  <div id="app">
    <RPlaceCanvas />
    <div class="powered-by">
      <div class="text">Powered by</div>
      <a href="https://barkle.chat/" target="_blank" rel="noopener noreferrer">
        <img
          src="https://barkle.us-east-1.linodeobjects.com/bk_/a4d9fb77-7120-486c-848c-5c0e7ff21069.png"
          alt="Barkle"
          class="barkle-logo"
        />
      </a>
    </div>
  </div>
</template>

<script>
import RPlaceCanvas from "./components/RPlaceCanvas.vue";

export default {
  components: {
    RPlaceCanvas,
  },
};
</script>

<style>
.powered-by {
  position: fixed;
  bottom: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.powered-by .text {
  font-size: 15px;
  color: #000;
  text-align: center;
}

.powered-by a {
  text-decoration: none;
}

.barkle-logo {
  width: 120px; /* Adjust the width as needed */
  height: auto;
  filter: grayscale(100%) brightness(50%); /* Make the image dark gray */
}
</style>
