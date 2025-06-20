<script setup lang="ts">
import { inject, Ref } from 'vue';

defineProps<{ fullscreen: boolean }>();
const emit = defineEmits(['toggle', 'close']);

let pageUrl = window.location.href;
let pageTitle = document.title;

const fullscreen = inject<Ref<boolean>>('fullscreen');
</script>

<template>
    <header class="header" fullscreen>
        <div class="app-bar-left-title-container">
            <span class="material-icons-outlined text-[var(--brand-primary)] text-2xl">build_circle</span>
            <h1 class="app-bar-title">DevTools Panel</h1>
        </div>

        <div class="app-bar-center-info-container">
            <div class="app-bar-page-title" title="Current Page Title Displayed Here">{{ pageTitle }}</div>
            <div class="app-bar-page-url truncate max-w-[250px]" :title="pageUrl">
                {{ pageUrl }}
            </div>
        </div>
        <div class="flex items-center justify-end gap-2">
            <button
                class="icon-button"
                id="toggle-fullscreen-btn"
                @click="emit('toggle')"
                :title="!fullscreen ? 'Enter Fullscreen' : 'Exit Fullscreen'"
            >
                <span class="material-icons-outlined text-xl" id="fullscreen-icon">
                    {{ !fullscreen ? 'fullscreen' : 'fullscreen_exit' }}
                </span>
            </button>
            <button class="icon-button" @click="emit('close')" title="Close Panel">
                <span class="material-icons-outlined text-xl">close</span>
            </button>
        </div>
    </header>
</template>

<style>
microtsm-devtools .header {
    background-color: var(--surface-elevated) !important;
    color: var(--text-primary) !important;
    border-bottom: 1px solid var(--border-neutral) !important;
    padding: 0 12px !important;
    height: 44px !important;
    flex-shrink: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    transition: border-radius 0.3s ease-in-out !important;
}

microtsm-devtools .icon-button {
    color: var(--text-secondary) !important;
    background-color: transparent !important;
    height: 30px !important;
    width: 30px !important;
    padding: 5px !important;
    border-radius: 5px !important;
    transition:
        background-color 0.1s ease-in-out !important,
        color 0.1 s ease-in-out !important;
}

microtsm-devtools .icon-button:not(:disabled):hover {
    background-color: rgba(0, 0, 0, 0.07) !important;
    color: var(--text-primary) !important;
}

microtsm-devtools .icon-button:not(:disabled):active {
    background-color: rgba(0, 0, 0, 0.1) !important;
}

microtsm-devtools .icon-button span {
    line-height: 1 !important;
}
</style>
