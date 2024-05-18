<template>
  <div id="app">
    <div class="container">
      <h1>MferVision</h1>
      <div id="main">
        <input type="file" @change="onFileChange" accept="image/*" />
        <div class="buttons">
          <button v-if="imageUrl" @click="addOverlay">add mfer eyes</button>
          <button v-if="overlays.length > 0" @click="deleteAllOverlays">delete all</button>
          <button v-if="imageUrl" @click="capturePreview">download image</button>
          <button v-if="imageUrl" @click="clearImage">clear image</button>
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
      </div>
      <div class="instructions">
        <h2>How to:</h2>
        <p>
          <strong>1. Upload Your Image:</strong> Click "Choose File" and pick your image.
        </p>
        <p>
          <strong>2. Add Mfer Eyes:</strong> Hit "add mfer eyes" to drop those $mfer logos.
        </p>
        <p>
          <strong>3. Position and Resize:</strong> Drag and resize to fit your eyes.
        </p>
        <p>
          <strong>4. Edit and Customize:</strong> Use "delete all" to clear overlays or "clear image" to start over.
        </p>
        <p>
          <strong>5. Download:</strong> Click "download image" to save your masterpiece as <code>mfer-eyes.png</code>.
        </p>
        <h3>Tips:</h3>
        <p>
          To delete an overlay, select it and press "Delete" or "Backspace".
        </p>
      </div>
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
      overlays.value.push({ x: 190, y: -220, width: 50, height: 50, active: false });
      overlays.value.push({ x: 250, y: -220, width: 50, height: 50, active: false });
    };

    const deleteAllOverlays = () => {
      overlays.value = [];
    };

    const clearImage = () => {
      imageUrl.value = null;
      overlays.value = [];
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
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const activeOverlayIndex = overlays.value.findIndex((overlay) => overlay.active);
        if (activeOverlayIndex !== -1) {
          deleteOverlay(activeOverlayIndex);
        }
      }
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
      capturePreview,
      onDrag,
      onDragStop,
      onResize,
      onResizeStop,
      deleteOverlay,
      activateOverlay,
      deactivateOverlay,
      handleKeyDown,
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

body {
  font-family: 'SartoshiScript';
  margin: 0;
  padding: 0;
  touch-action: manipulation; /* Prevent double-tap to zoom */
}

h1 {
  font-size: 3em;
  text-align: center;
}

h2 {
  font-size: 1.4em;
}

.container {
  padding: 10px;
  max-width: 100%;
  text-align: center;
}

.image-container {
  position: relative;
  display: inline-block;
  width: 100%;
  max-width: 400px; /* Adjust this value to control the maximum width */
  height: auto;
  background: white;
  margin: 0 auto;
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

.overlay-image {
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.instructions {
  margin-top: 20px;
  font-size: 1.5em;
  line-height: 1.3;
  text-align: left;
  padding: 0 5%;
}

.instructions h2 {
  text-align: center;
  margin-bottom: 20px;
}

.instructions p {
  margin-bottom: 20px;
}



</style>
