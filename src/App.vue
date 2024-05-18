<template>
  <div id="app">
    <div class="container">
      <h1>MferVision</h1>
      <p class="by-cc0mfer">
        by <a href="https://x.com/cc0mfer" target="_blank">@cc0mfer</a>
      </p>
      <div id="main-container">
        <input v-if="!imageUrl" type="file" ref="fileInput" @change="onFileChange" accept="image/*" />
        <div v-if="imageUrl" class="buttons">
          <button v-if="overlays.length > 0" @click="deleteAllOverlays">clear image</button>
          <button v-if="imageUrl" @click="clearImage">start over</button>
          <button v-if="imageUrl && overlays.length > 0" @click="capturePreview">download</button>
          <button v-if="imageUrl" @click="addOverlay">add $mfer eyes</button>
          <button v-if="overlays.length > 0" @click="decreaseOverlaySize">-</button>
          <button v-if="overlays.length > 0" @click="increaseOverlaySize">+</button>
        </div>
        <div v-if="imageUrl" class="image-container" ref="previewContainer">
          <cropper
            class="cropper"
            :src="imageUrl"
            :stencil-props="stencilProps"
            @change="onCropChange"
            @ready="onImageReady"
            ref="cropper"
          />
          <div v-for="(overlay, index) in overlays" :key="index" class="overlay-container">
            <vue3-draggable-resizable
              :x="overlay.x"
              :y="overlay.y"
              :w="overlay.width"
              :h="overlay.height"
              :aspect-ratio="true"
              @dragging="onDrag(index, $event)"
              @resizing="onResize(index, $event)"
              @resize-stop="onResizeStop(index, $event)"
              @drag-stop="onDragStop(index, $event)"
              :active="overlay.active"
              @activated="activateOverlay(index)"
              @deactivated="deactivateOverlay(index)"
            >
              <img :src="overlayUrl" alt="Overlay" class="overlay-image" />
            </vue3-draggable-resizable>
          </div>
        </div>
        <img v-else src="@/assets/instructions.png" alt="Instructions" class="instructions-image" />
      </div>
      <div class="instructions">
        <h2>How to:</h2>
        <p class="instruction-title"><strong>1. Upload Your Image</strong></p>
        <p class="shift">- Click "Choose File" and pick your image</p>

        <p class="instruction-title"><strong>2. Add Mfer Eyes</strong></p>
        <p class="shift">- Hit "add mfer eyes" to drop those $mfer logos</p>

        <p class="instruction-title"><strong>3. Position and Resize</strong></p>
        <p class="shift">- Drag and resize to fit your eyes</p>
        <p class="shift">- Use "+" and "-" to adjust the size of the overlays</p>

        <p class="instruction-title"><strong>4. Download</strong></p>
        <p class="shift">- Click "download" to save your masterpiece to this device.</p>

      </div>
      <footer class="footer">
        <p>
          like it? send tips to cc0mfer.eth
        </p>
        <p>
          This project is licensed under the <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank">CC0 License</a>.
          <br>
          <a href="https://github.com/cc0mfer/mfervision" target="_blank">Fork this on GitHub</a>
        </p>
      </footer>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick } from 'vue';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import Vue3DraggableResizable from "vue3-draggable-resizable";
import "vue3-draggable-resizable/dist/Vue3DraggableResizable.css";
import html2canvas from 'html2canvas';

export default {
  components: {
    Cropper,
    Vue3DraggableResizable,
  },
  setup() {
    const imageUrl = ref(null);
    const overlayUrl = ref(null);
    const overlays = ref([]);
    const imageRect = ref(null);
    const croppedCoordinates = ref(null);
    const fileInput = ref(null); // Reference to the file input

    const stencilProps = computed(() => ({
      handlers: {},
      lines: {},
      movable: false,
      resizable: false,
      aspectRatio: 1
    }));

    const onFileChange = (event) => {
      const file = event.target.files[0];
      clearImage();
      imageUrl.value = URL.createObjectURL(file);
      overlayUrl.value = new URL('/src/assets/mfercoin.png', import.meta.url).href;
    };

    const onImageReady = () => {
      nextTick(() => {
        const imageElement = document.querySelector('.cropper img');
        if (imageElement) {
          imageRect.value = imageElement.getBoundingClientRect();
          console.log('Image ready:', imageRect.value);
        }
      });
    };

    const addOverlay = () => {
      overlays.value.push({ x: 190, y: -220, width: 42.69, height: 42.69, active: false });
      overlays.value.push({ x: 250, y: -220, width: 42.69, height: 42.69, active: false });
    };

    const deleteAllOverlays = () => {
      overlays.value = [];
    };

    const clearImage = () => {
      imageUrl.value = null;
      overlays.value = [];
      fileInput.value.value = null; // Reset the file input
    };

    const onCropChange = ({ coordinates, canvas }) => {
      croppedCoordinates.value = coordinates;
      console.log(coordinates, canvas);
    };

    const capturePreview = async () => {
      const previewContainer = document.querySelector('.image-container');
      if (!previewContainer) {
        console.error('Preview container not found.');
        return;
      }

      try {
        const canvas = await html2canvas(previewContainer, { useCORS: true });
        const link = document.createElement('a');
        link.download = 'mfer-eyes.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Error capturing preview:', error);
      }
    };

    const onDrag = (index, event) => {
      overlays.value[index].x = event.x;
      overlays.value[index].y = event.y;
    };

    const onDragStop = async (index, event) => {
      await nextTick();

      const overlay = overlays.value[index];
      overlay.x = event.x;
      overlay.y = event.y;
    };

    const onResize = (index, { width, height }) => {
      overlays.value[index].width = width;
      overlays.value[index].height = height;
    };

    const onResizeStop = (index, { width, height }) => {
      overlays.value[index].width = width;
      overlays.value[index].height = height;
    };

    const deleteOverlay = (index) => {
      overlays.value.splice(index, 1);
    };

    const activateOverlay = (index) => {
      overlays.value.forEach((overlay, i) => {
        overlay.active = i === index;
      });
    };

    const deactivateOverlay = (index) => {
      overlays.value[index].active = false;
    };

    const handleKeyDown = (event) => {
      const activeOverlayIndex = overlays.value.findIndex((overlay) => overlay.active);
      if (activeOverlayIndex !== -1) {
        switch (event.key) {
          case 'Delete':
          case 'Backspace':
            deleteOverlay(activeOverlayIndex);
            break;
          case 'ArrowUp':
            event.preventDefault();
            overlays.value[activeOverlayIndex].y -= 1;
            break;
          case 'ArrowDown':
            event.preventDefault();
            overlays.value[activeOverlayIndex].y += 1;
            break;
          case 'ArrowLeft':
            event.preventDefault();
            overlays.value[activeOverlayIndex].x -= 1;
            break;
          case 'ArrowRight':
            event.preventDefault();
            overlays.value[activeOverlayIndex].x += 1;
            break;
        }
      }
    };

    const increaseOverlaySize = () => {
      overlays.value.forEach((overlay) => {
        overlay.width += 1;
        overlay.height += 1;
      });
    };

    const decreaseOverlaySize = () => {
      overlays.value.forEach((overlay) => {
        overlay.width = Math.max(1, overlay.width - 1); // Prevent width from going below 1
        overlay.height = Math.max(1, overlay.height - 1); // Prevent height from going below 1
      });
    };

    return {
      imageUrl,
      overlayUrl,
      overlays,
      croppedCoordinates,
      imageRect,
      stencilProps,
      onFileChange,
      onImageReady,
      addOverlay,
      deleteAllOverlays,
      clearImage,
      onCropChange,
      fileInput,
      capturePreview,
      onDrag,
      onDragStop,
      onResize,
      onResizeStop,
      deleteOverlay,
      activateOverlay,
      deactivateOverlay,
      handleKeyDown,
      increaseOverlaySize,
      decreaseOverlaySize,
    };
  },
  mounted() {
    document.addEventListener('keydown', this.handleKeyDown);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  },
};
</script>


<style>
@font-face {
  font-family: 'SartoshiScript';
  src: url('@/assets/fonts/SartoshiScript-Regular.otf') format('opentype');
  font-weight: normal;
  font-style: normal;
}

#app {
  overflow: hidden; /* Prevent scrolling */
}

#main-container {
  padding-top: 8%
}

body {
  font-family: 'SartoshiScript';
  margin: 0;
  padding: 0;
  touch-action: manipulation; /* Prevent double-tap to zoom */
}

h1 {
  font-size: 3em;
  text-align: center;
  margin-bottom: 5px; /* Reduce the space below the heading */
}

.shift {
  margin-left: 3%;
}

.by-cc0mfer {
  font-size: 1em;
  text-align: center;
  color: #666;
  margin-top: 0; /* Reduce the space above the text */
}

.by-cc0mfer a {
  color: #379E15;
  text-decoration: none;
}

.by-cc0mfer a:hover {
  text-decoration: underline;
}

h2 {
  font-size: 1.7em;
  text-decoration: underline;
  text-underline-position: under;
}

.container {
  padding: 10px;
  max-width: 100%;
  text-align: center;
}

.image-container {
  position: relative;
  display: inline-block;
  width: 90%;
  max-width: 300px; /* Adjust this value to control the maximum width */
  height: auto;
  background: white;
  margin: 0 auto;
}

.instructions-image {
  width: 90%;
  max-width: 300px;
  margin: 20px auto;
}

.cropper {
  width: 100%;
  height: auto;
  max-height: 80vh; /* Ensure the cropper fits within the viewport height */
  background: #ddd;
  object-fit: contain; /* Ensure the image scales down to fit within the container */
}

.overlay-container {
  position: absolute;
  z-index: 10; /* Ensure overlays are above the pan zoom canvas */
}

.overlay-image {
  width: 100%;
  height: 100%;
  pointer-events: none;
  -webkit-touch-callout: none; /* Prevent touch callout on iOS */
  user-select: none; /* Prevent selection */
}

.buttons {
  display: flex;
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
  gap: 10px;
  font-size: 1.5em;
  margin-bottom: 6%; /* Add some space below the buttons */
  margin-top: 6%; /* Add some space above the buttons */
  flex-wrap: wrap; /* Allow buttons to wrap if needed */
}

button {
  font-size: 1em;
  flex: 1 1 auto; /* Allow buttons to shrink if needed */
  padding: 1%;
}

.delete-button {
  background: red;
  color: white;
  border: none;
  cursor: pointer;
}

.vue-advanced-cropper__foreground {
  background: none;
}

.instructions {
  margin-top: 20px;
  font-size: 1.2em;
  line-height: 1.3;
  text-align: left;
  padding: 0 5%;
}

.instruction-title {
  font-size: 1.5em;
}

.instructions h2 {
  text-align: center;
  margin-bottom: 20px;
}

.instructions p {
  margin-bottom: 10px; /* Add some space between paragraphs */
}

.footer {
  margin-top: 20px;
  font-size: 1.3em;
  text-align: center;
  color: #666;
}

.footer a {
  color: #379E15;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}
</style>
