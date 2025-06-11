import panelHtml from './panel.html?raw';
import panelCss from './panel.css?raw';

(async () => {
    const iconifyScript = document.createElement('script');
    iconifyScript.src = 'https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js';
    document.head.appendChild(iconifyScript);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = panelHtml;

    const panel = wrapper.querySelector('#devtools-panel')!;

    const styleTag = document.createElement('style');
    styleTag.innerHTML = panelCss;
    panel.prepend(styleTag);

    const scriptTag = document.createElement('script');
    const panelUrl = import.meta.url.replace(/[^/]+\.js$/, 'panel.js');
    const res = await fetch(panelUrl);
    scriptTag.innerHTML = await res.text();
    panel.prepend(scriptTag);

    document.body.prepend(wrapper.children[0]);
})();
