<script setup lang="ts">
import { onMounted, onUnmounted, provide, ref } from 'vue';
import Header from './Header.vue';
import Sidebar from './Sidebar.vue';
import MainContent from './MainContent.vue';
import Footer from './Footer.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import tabs from './tabs.ts';
import WelcomeDialog from './WelcomeDialog.vue';

const panel = ref<HTMLElement | null>(null);
const panelVisible = ref(false);
const fullscreen = ref(false);
const activeTab = ref(tabs[0]);
// Instead of a boolean, we use a string to mark which edge is being resized.
const resizeStatus = ref<'top' | 'left' | 'corner' | false>(false);
const seenWelcomeDialog = ref(getCookie('seenWelcomeDialog') === 'true');

// Store initial values when dragging starts.
const initial = {
    width: 0,
    height: 0,
    startX: 0,
    startY: 0,
};

provide('fullscreen', fullscreen);

onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyPress);
});

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
    const newHeight = Math.max(200, initial.height - deltaY);
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
    const newWidth = Math.max(300, initial.width - deltaX);
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
    const newWidth = Math.max(300, initial.width - deltaX);
    const newHeight = Math.max(200, initial.height - deltaY);
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

function setCookie(name: string, value: string) {
    document.cookie = `${name}=${value}; path=/; max-age=31536000`;
}

function getCookie(name: string) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

const toggleFullscreen = (is?: boolean) => {
    fullscreen.value = is ?? !fullscreen.value;

    if (fullscreen.value) {
        panel.value?.removeAttribute('style');
    } else {
        setTimeout(restorePanelSize, 0);
    }
};

const restorePanelSize = () => {
    if (fullscreen.value) return;

    const savedWidth = getCookie('devtoolsWidth') ?? '800px';
    const savedHeight = getCookie('devtoolsHeight');
    if (savedWidth && panel.value) panel.value.style.width = parseInt(savedWidth) + 'px';
    if (savedHeight && panel.value) panel.value.style.height = parseInt(savedHeight) + 'px';
};

const togglePanel = (open?: boolean) => {
    open ??= !panelVisible.value;
    if (open) {
        restorePanelSize();
        panelVisible.value = true;
        window.addEventListener('resize', restorePanelSize);
    } else {
        panel.value?.classList.remove('panel-visible');
        setTimeout(() => {
            panelVisible.value = false;
        }, 300);
        window.removeEventListener('resize', restorePanelSize);
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

const onUserPressGotItButton = () => {
    setCookie('seenWelcomeDialog', 'true');
    const welcome = document.body.querySelector('#devtools-guide-dialog');
    welcome?.classList.add('hidden');
    setTimeout(() => {
        welcome?.remove();
    }, 300);
    panelVisible.value = true;
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

    <WelcomeDialog v-if="!seenWelcomeDialog" @got-it="onUserPressGotItButton" />
</template>

<style>
@reference "tailwindcss";

microtsm-devtools {
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

microtsm-devtools #devtools-panel {
    font-family:
        'Inter',
        -apple-system,
        BlinkMacSystemFont,
        'San Francisco',
        'Helvetica Neue',
        'Arial',
        sans-serif !important;
    background-color: var(--surface-base) !important;
    color: var(--text-primary) !important;
    -webkit-font-smoothing: antialiased !important;
    -moz-osx-font-smoothing: grayscale !important;
    will-change: width, height !important;
}

microtsm-devtools #devtools-panel {
    transform-origin: bottom right !important;
    transition:
        width 0.3s ease-in-out,
        height 0.3s ease-in-out,
        max-height 0.3s ease-in-out,
        border-radius 0.3s ease-in-out,
        opacity 0.3s ease-in-out,
        transform 0.3s ease-in-out !important;
    opacity: 0 !important;
    transform: scale(0.95) translate(10px, 10px) !important;
}

microtsm-devtools .devtools-panel-compact {
    @apply fixed bottom-4 right-4 w-[800px] h-[78vh] max-h-[calc(100vh-32px)] max-w-[calc(100vw-32px)];
    background-color: var(--surface-elevated) !important;
    border-radius: 10px !important;
    box-shadow: var(--shadow-lg) !important;
    border: 1px solid #c6c6c6 !important;
    overflow: hidden !important;
}

microtsm-devtools .devtools-panel-fullscreen {
    @apply w-screen h-screen fixed top-0 left-0;
}

microtsm-devtools .devtools-panel-fullscreen .header,
microtsm-devtools .devtools-panel-fullscreen .footer {
    border-radius: 0 !important;
}

microtsm-devtools #devtools-panel.panel-visible {
    opacity: 1 !important;
    transform: scale(1) translate(0, 0) !important;
    z-index: 2147483647 !important;
}

microtsm-devtools .devtools-panel-fullscreen {
    border-radius: 0 !important;
}

microtsm-devtools #devtools-panel button,
microtsm-devtools #confirm-dialog button {
    cursor: pointer !important;
}

microtsm-devtools .app-bar-left-title-container {
    display: flex !important;
    align-items: center !important;
}

microtsm-devtools .app-bar-title {
    font-size: 0.9375rem !important;
    font-weight: 600 !important;
    line-height: 1 !important;
    color: var(--text-primary) !important;
    margin-left: 8px !important;
}

microtsm-devtools .app-bar-center-info-container {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    position: absolute !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
}

microtsm-devtools .app-bar-page-title {
    font-size: 0.8125rem !important;
    font-weight: 500 !important;
    color: var(--text-primary) !important;
    line-height: 1.2 !important;
    max-width: 300px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
}

microtsm-devtools .app-bar-page-url {
    font-size: 0.6875rem !important;
    color: var(--text-tertiary) !important;
    line-height: 1.2 !important;
    max-width: 300px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
}

microtsm-devtools .section-title {
    font-size: 1rem !important;
    font-weight: 600 !important;
    color: var(--text-primary) !important;
    line-height: 1.4 !important;
}

microtsm-devtools .info-card {
    background-color: #fdfdfd !important;
    padding: 12px !important;
    border-radius: 6px !important;
    box-shadow: none !important;
    border: 1px solid var(--border-neutral) !important;
}

microtsm-devtools .info-card-label {
    color: var(--text-secondary) !important;
    font-size: 0.8125rem !important;
    margin-bottom: 3px !important;
}

microtsm-devtools .info-card-value {
    color: var(--text-primary) !important;
    font-size: 0.875rem !important;
    font-weight: 400 !important;
    background-color: var(--surface-base) !important;
    padding: 5px 8px !important;
    border-radius: 4px !important;
    border: 1px solid #d6d6d6 !important;
    word-break: break-all !important;
    font-family: 'SF Mono', 'Menlo', monospace !important;
}
</style>
