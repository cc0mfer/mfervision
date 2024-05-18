import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import panZoom from 'vue-panzoom'

const app = createApp(App)
app.use(panZoom)
app.mount('#app')