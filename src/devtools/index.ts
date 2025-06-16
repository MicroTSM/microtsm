import { createApp } from 'vue';
import DevToolsPanel from './DevToolsPanel.vue';
import './style.css';

const linkEls: HTMLLinkElement[] = [];

const injectLink = (href: string, rel: string, crossOrigin?: string) => {
    const link = document.createElement('link');
    link.href = href;
    link.rel = rel;
    if (crossOrigin) link.crossOrigin = crossOrigin;
    document.head.appendChild(link);
    linkEls.push(link);
};

injectLink('https://fonts.googleapis.com', 'preconnect');
injectLink('https://fonts.gstatic.com', 'preconnect', '');
injectLink('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', 'stylesheet');
injectLink('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap', 'stylesheet');

const { mount: vueMount, unmount, onUnmount } = createApp(DevToolsPanel);

onUnmount(() => {
    linkEls.forEach((link) => {
        link.remove();
    });

    document.getElementById('microtsm-devtools')?.remove();
});

function mount() {
    const devtools = document.createElement('div');
    devtools.id = 'microtsm-devtools';
    document.body.appendChild(devtools);

    vueMount(devtools);
}

export { mount, unmount };
