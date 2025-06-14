<script setup lang="ts">
import { onMounted, onUnmounted, provide, ref } from 'vue';
import Header from './Header.vue';
import Sidebar from './Sidebar.vue';
import MainContent from './MainContent.vue';
import Footer from './Footer.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import tabs from './tabs.ts';

const panel = ref<HTMLElement | null>(null);
const panelVisible = ref(false);
const fullscreen = ref(false);
const activeTab = ref(tabs[0]);
// Instead of a boolean, we use a string to mark which edge is being resized.
const resizeStatus = ref<'top' | 'left' | 'corner' | false>(false);

// Store initial values when dragging starts.
const initial = {
    width: 0,
    height: 0,
    startX: 0,
    startY: 0,
};

provide('fullscreen', fullscreen);

onMounted(() => {
    // Inject Tailwind and fonts.
    injectScript('https://cdn.tailwindcss.com?plugins=forms,container-queries');
    injectLink('https://fonts.googleapis.com', 'preconnect');
    injectLink('https://fonts.gstatic.com', 'preconnect', '');
    injectLink('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', 'stylesheet');
    injectLink('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap', 'stylesheet');
    injectLink('https://fonts.googleapis.com/icon?family=Material+Icons+Outlined', 'stylesheet');
    injectLink('https://fonts.googleapis.com/icon?family=Material+Icons+Round', 'stylesheet');

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyPress);
});

const getMaxWidth = () => window.innerWidth - 32;
const getMaxHeight = () => window.innerHeight - 32;

const initTopResize = (e: MouseEvent) => {
    e.preventDefault();
    if (!panel.value) return;
    initial.height = panel.value.offsetHeight;
    initial.startY = e.clientY;
    resizeStatus.value = 'top';
    window.addEventListener('mousemove', doTopResize);
    window.addEventListener('mouseup', stopResize);
};

const doTopResize = (e: MouseEvent) => {
    if (resizeStatus.value !== 'top' || !panel.value) return;
    // Calculate how far the mouse has moved.
    const deltaY = e.clientY - initial.startY;
    // Since the panel is anchored bottom, subtract delta to increase height when dragging upward.
    const newHeight = Math.min(Math.max(200, initial.height - deltaY), getMaxHeight());
    panel.value.style.height = `${newHeight}px`;
};

const initLeftResize = (e: MouseEvent) => {
    e.preventDefault();
    if (!panel.value) return;
    initial.width = panel.value.offsetWidth;
    initial.startX = e.clientX;
    resizeStatus.value = 'left';
    window.addEventListener('mousemove', doLeftResize);
    window.addEventListener('mouseup', stopResize);
};

const doLeftResize = (e: MouseEvent) => {
    if (resizeStatus.value !== 'left' || !panel.value) return;
    const deltaX = e.clientX - initial.startX;
    // Increase width when dragging leftward (deltaX negative) while clamping it.
    const newWidth = Math.min(Math.max(300, initial.width - deltaX), getMaxWidth());
    panel.value.style.width = `${newWidth}px`;
};

const initCornerResize = (e: MouseEvent) => {
    e.preventDefault();
    if (!panel.value) return;
    initial.width = panel.value.offsetWidth;
    initial.height = panel.value.offsetHeight;
    initial.startX = e.clientX;
    initial.startY = e.clientY;
    resizeStatus.value = 'corner';
    window.addEventListener('mousemove', doCornerResize);
    window.addEventListener('mouseup', stopResize);
};

const doCornerResize = (e: MouseEvent) => {
    if (resizeStatus.value !== 'corner' || !panel.value) return;
    const deltaX = e.clientX - initial.startX;
    const deltaY = e.clientY - initial.startY;
    const newWidth = Math.min(Math.max(300, initial.width - deltaX), getMaxWidth());
    const newHeight = Math.min(Math.max(200, initial.height - deltaY), getMaxHeight());
    panel.value.style.width = `${newWidth}px`;
    panel.value.style.height = `${newHeight}px`;
};

const stopResize = () => {
    resizeStatus.value = false;
    window.removeEventListener('mousemove', doTopResize);
    window.removeEventListener('mousemove', doLeftResize);
    window.removeEventListener('mousemove', doCornerResize);
    window.removeEventListener('mouseup', stopResize);
    // Only update cookies when the user stops resizing.
    if (panel.value) {
        setCookie('devtoolsWidth', panel.value.style.width);
        setCookie('devtoolsHeight', panel.value.style.height);
    }
};

const setCookie = (name: string, value: string) => {
    document.cookie = `${name}=${value}; path=/; max-age=31536000`;
};

const getCookie = (name: string) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
};

const injectLink = (href: string, rel: string, crossOrigin?: string) => {
    const link = document.createElement('link');
    link.href = href;
    link.rel = rel;
    if (crossOrigin) link.crossOrigin = crossOrigin;
    document.head.appendChild(link);
};

const injectScript = (src: string) => {
    const script = document.createElement('script');
    script.src = src;
    document.head.appendChild(script);
};

const toggleFullscreen = (is?: boolean) => {
    fullscreen.value = is ?? !fullscreen.value;

    if (fullscreen.value) {
        panel.value?.removeAttribute('style');
    } else {
        setTimeout(restorePanelSize, 0);
    }
};

const restorePanelSize = () => {
    const savedWidth = getCookie('devtoolsWidth');
    const savedHeight = getCookie('devtoolsHeight');
    if (savedWidth && panel.value) panel.value.style.width = savedWidth;
    if (savedHeight && panel.value) panel.value.style.height = savedHeight;
};

const togglePanel = (open?: boolean) => {
    open ??= !panelVisible.value;
    if (open) {
        restorePanelSize();
        panelVisible.value = true;
    } else {
        panel.value?.classList.remove('panel-visible');
        setTimeout(() => {
            panelVisible.value = false;
        }, 300);
    }
};

const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === '`') {
        togglePanel();
    }
};

const handleKeyPress = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'F11') {
        event.preventDefault();
        toggleFullscreen();
    }
    if (event.ctrlKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
        event.preventDefault();
        toggleFullscreen(event.key === 'ArrowUp');
    }
};
</script>

<template>
    <div
        ref="panel"
        :class="[
            'overflow-hidden flex flex-col',
            {
                'devtools-panel-fullscreen': fullscreen,
                'devtools-panel-compact': !fullscreen,
                'panel-visible': panelVisible,
                '!transition-none': resizeStatus,
            },
        ]"
        id="devtools-panel"
    >
        <template v-if="panelVisible">
            <!-- Top Edge Resizer -->
            <div
                ref="resizerTop"
                @mousedown="initTopResize"
                class="absolute top-0 left-0 w-full h-1 cursor-ns-resize hover:bg-gray-200/50"
            ></div>
            <!-- Left Edge Resizer -->
            <div
                ref="resizerLeft"
                @mousedown="initLeftResize"
                class="absolute top-0 left-0 h-full w-1 cursor-ew-resize hover:bg-gray-200/50"
            ></div>
            <!-- Top-Left Corner Resizer -->
            <div
                ref="resizerCorner"
                @mousedown="initCornerResize"
                class="absolute top-0 left-0 w-4 h-4 cursor-nw-resize hover:bg-gray-200/50"
            ></div>
            <Header :fullscreen="fullscreen" @toggle="toggleFullscreen" @close="togglePanel(false)" />
            <div class="flex flex-grow overflow-hidden">
                <Sidebar v-model:activeTab="activeTab" />
                <MainContent v-if="panelVisible" :activeTab="activeTab" />
            </div>
            <Footer />
        </template>
    </div>
    <ConfirmDialog v-if="panelVisible" />
</template>

<style>
@reference "tailwindcss";

:root {
    --brand-primary: #0a84ff;
    --brand-secondary: #ff9f0a;
    --surface-base: #ffffff;
    --surface-elevated: #f9f9fb;
    --surface-overlay: rgba(0, 0, 0, 0.4);
    --text-primary: #000000;
    --text-secondary: #3c3c43;
    --text-tertiary: #8a8a8e;
    --text-on-brand: #ffffff;
    --text-placeholder: #c7c7cc;
    --border-neutral: #d1d1d6;
    --border-focused: #0a84ff;
    --status-success-bg: #d7f9e9;
    --status-success-text: #30d158;
    --status-warning-bg: #fff4d9;
    --status-warning-text: #ff9500;
    --status-error-bg: #ffe5e5;
    --status-error-text: #ff3b30;
    --status-info-bg: #d7f0ff;
    --status-info-text: #007aff;
    --shadow-sm: 0px 1px 1px rgba(0, 0, 0, 0.03), 0px 0px 0.5px rgba(0, 0, 0, 0.05);
    --shadow-md: 0px 2px 4px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-lg: 0px 6px 12px rgba(0, 0, 0, 0.1), 0px 3px 6px rgba(0, 0, 0, 0.08);
    --table-header-bg: #f0f2f5;
}

#devtools-panel {
    font-family:
        'Inter',
        -apple-system,
        BlinkMacSystemFont,
        'San Francisco',
        'Helvetica Neue',
        'Arial',
        sans-serif;
    background-color: var(--surface-base);
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* Enable smoother resizing by hinting to the browser which properties change */
    will-change: width, height;
}

.table-container {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid var(--border-neutral);
    border-radius: 6px;
    background-color: var(--surface-base);
}

.icon-button {
    color: var(--text-secondary);
    background-color: transparent;
    height: 30px;
    width: 30px;
    padding: 5px;
    border-radius: 5px;
    transition:
        background-color 0.1s ease-in-out,
        color 0.1s ease-in-out;
}

.icon-button:not(:disabled):hover {
    background-color: rgba(0, 0, 0, 0.07);
    color: var(--text-primary);
}

.icon-button:not(:disabled):active {
    background-color: rgba(0, 0, 0, 0.1);
}

.icon-button span {
    line-height: 1;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    border: 1px solid transparent;
}

.status-badge-green {
    background-color: var(--status-success-bg);
    color: var(--status-success-text);
}

.status-badge-yellow {
    background-color: var(--status-warning-bg);
    color: var(--status-warning-text);
}

.status-badge-red {
    background-color: var(--status-error-bg);
    color: var(--status-error-text);
}

.status-badge-gray {
    background-color: #e5e5ea;
    color: #3c3c43;
}

.status-badge .material-icons-outlined,
.status-badge .material-icons-round {
    font-size: 14px;
    margin-right: 5px;
}

input[type='text'],
input[type='search'] {
    background-color: var(--surface-base);
    border: 1px solid #c6c6c6;
    border-radius: 6px;
    padding: 7px 10px;
    font-size: 0.875rem;
    color: var(--text-primary);
    transition:
        border-color 0.15s ease-in-out,
        box-shadow 0.15s ease-in-out;
    appearance: none;
    height: 32px;
}

input[type='text']::placeholder,
input[type='search']::placeholder {
    color: var(--text-placeholder);
}

input[type='text']:focus,
input[type='search']:focus {
    border-color: var(--border-focused);
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.25);
    outline: none;
}

.module-override-url {
    font-size: 0.8125rem;
    background-color: transparent;
    border: none;
    padding: 3px;
    color: var(--text-primary);
    width: 100%;
    border-radius: 4px;
}

.module-override-url:focus {
    outline: none;
    background-color: var(--status-info-bg);
    box-shadow: 0 0 0 1.5px var(--brand-primary);
}

.dialog-overlay {
    background-color: var(--surface-overlay);
}

.dialog-content {
    background-color: #fdfdfd;
    border-radius: 12px;
    box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.15);
    padding: 24px;
    border: none;
    min-width: 200px;
    max-width: 360px;
}

.dialog-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.3;
    text-align: center;
}

.dialog-message {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 12px;
    line-height: 1.5;
    text-align: center;
}

.dialog-icon-area {
    margin-bottom: 16px;
    display: flex;
    justify-content: center;
}

.dialog-icon-area .material-icons-outlined {
    font-size: 28px;
    color: var(--brand-primary);
}

.dialog-checkbox-label {
    font-size: 0.875rem;
    color: var(--text-primary);
}

input[type='checkbox'] {
    border-radius: 4px;
    border: 1px solid #bdbdbd;
    color: var(--brand-primary);
    background-color: #ffffff;
    width: 18px;
    height: 18px;
    appearance: none;
    position: relative;
    cursor: pointer;
    vertical-align: middle;
    margin-top: -2px;
}

input[type='checkbox']:checked {
    background-color: var(--brand-primary);
    border-color: var(--brand-primary);
}

input[type='checkbox']:checked::before {
    content: 'check';
    font-family: 'Material Icons Round';
    font-size: 14px;
    color: var(--text-on-brand);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: bold;
}

input[type='checkbox']:focus {
    outline: none;
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.25);
}

.button-primary {
    background-color: var(--brand-primary);
    color: var(--text-on-brand);
    font-weight: 500;
    font-size: 0.875rem;
    padding: 6px 16px;
    border-radius: 6px;
    transition: background-color 0.1s ease-in-out;
    height: 32px;
    text-transform: none;
    letter-spacing: normal;
    border: none;
}

.button-primary:hover {
    background-color: #0070dd;
}

.button-primary:active {
    background-color: #005cbf;
}

.button-secondary {
    background-color: #e9e9eb;
    color: var(--text-primary);
    font-weight: 500;
    font-size: 0.875rem;
    padding: 6px 16px;
    border-radius: 6px;
    border: 1px solid #d1d1d6;
    transition:
        background-color 0.1s ease-in-out,
        border-color 0.1s ease;
    height: 32px;
    text-transform: none;
    letter-spacing: normal;
}

.button-secondary:hover {
    background-color: #dddee0;
    border-color: #c6c6c9;
}

.button-secondary:focus {
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.25);
    outline: none;
}

.button-secondary:active {
    background-color: #d2d3d5;
    border-color: #b8b8bb;
}

.header {
    background-color: var(--surface-elevated);
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-neutral);
    padding: 0 12px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: border-radius 0.3s ease-in-out;
}

.footer {
    background-color: var(--surface-elevated);
    color: var(--text-tertiary);
    border-top: 1px solid var(--border-neutral);
    padding: 6px 14px;
    height: 30px;
    font-size: 0.75rem;
    text-align: center;
    transition: border-radius 0.3s ease-in-out;
}

.devtools-panel-compact {
    @apply fixed bottom-4 right-4 w-[800px] max-h-[calc(100vh-32px)];
    background-color: var(--surface-elevated);
    border-radius: 10px;
    box-shadow: var(--shadow-lg);
    border: 1px solid #c6c6c6;
    overflow: hidden;
}

.devtools-panel-fullscreen {
    @apply w-screen h-screen fixed top-0 left-0;
}

.devtools-panel-fullscreen .header,
.devtools-panel-fullscreen .footer {
    border-radius: 0;
}

.app-bar-left-title-container {
    display: flex;
    align-items: center;
}

.app-bar-title {
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1;
    color: var(--text-primary);
    margin-left: 8px;
}

.app-bar-center-info-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
}

.app-bar-page-title {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1.2;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.app-bar-page-url {
    font-size: 0.6875rem;
    color: var(--text-tertiary);
    line-height: 1.2;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.section-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.4;
}

.log-container {
    background-color: #ffffff;
    color: #1e1e1e;
    padding: 12px;
    border-radius: 6px;
    font-family: 'SF Mono', 'Menlo', 'Courier New', monospace;
    font-size: 0.8125rem;
    max-height: 300px;
    overflow-y: auto;
    line-height: 1.6;
    border: 1px solid var(--border-neutral);
}

.log-container p .text-sky-300 {
    color: #50e3c2;
}

.log-container p .text-cyan-300 {
    color: #4a90e2;
}

.log-container p .text-yellow-300 {
    color: #f5a623;
}

.log-container p .text-purple-300 {
    color: #bd10e0;
}

.log-container p .text-yellow-200 {
    color: #f8e71c;
}

.log-container p .text-red-300 {
    color: #d0021b;
}

.log-container p a {
    color: var(--brand-primary);
}

.log-container p a:hover {
    text-decoration: underline;
}

.info-card {
    background-color: #fdfdfd;
    padding: 12px;
    border-radius: 6px;
    box-shadow: none;
    border: 1px solid var(--border-neutral);
}

.info-card-label {
    color: var(--text-secondary);
    font-size: 0.8125rem;
    margin-bottom: 3px;
}

.info-card-value {
    color: var(--text-primary);
    font-size: 0.875rem;
    font-weight: 400;
    background-color: var(--surface-base);
    padding: 5px 8px;
    border-radius: 4px;
    border: 1px solid #d6d6d6;
    word-break: break-all;
    font-family: 'SF Mono', 'Menlo', monospace;
}

#devtools-panel {
    transform-origin: bottom right;
    transition:
        width 0.3s ease-in-out,
        height 0.3s ease-in-out,
        max-height 0.3s ease-in-out,
        border-radius 0.3s ease-in-out,
        opacity 0.3s ease-in-out,
        transform 0.3s ease-in-out;
    opacity: 0;
    transform: scale(0.95) translate(10px, 10px);
}

#devtools-panel.panel-visible {
    opacity: 1;
    transform: scale(1) translate(0, 0);
}

.devtools-panel-fullscreen {
    border-radius: 0 !important;
}
</style>
