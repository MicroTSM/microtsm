import { App, createApp } from 'vue';
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

const devtools = document.createElement('microtsm-devtools');
let unmount: App['unmount'];

const onUnmount = () => {
    linkEls.forEach((link) => {
        link.remove();
    });

    document.body.removeChild(devtools);
};

function mount() {
    const app = createApp(DevToolsPanel);
    document.body.appendChild(devtools);
    app.onUnmount(onUnmount);
    unmount = app.unmount;
    app.mount(devtools);
}

export { mount, unmount };
