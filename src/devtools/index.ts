import { createApp } from 'vue';
import DevToolsPanel from './DevToolsPanel.vue';

import './style.css';

const iconifyScript = document.createElement('script');
iconifyScript.src = 'https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js';
document.head.appendChild(iconifyScript);

createApp(DevToolsPanel).mount('body');
