import createVueMicroApp from '@microtsm/vue';
import { createApp } from 'vue';
import App from '@/App.vue';

export const { mount, unmount } = createVueMicroApp(createApp(App), {
    el: '#app', // Only used for standalone development
});
