<script setup lang="ts">
import { computed, ref } from 'vue';
import Header from './Header.vue';
import Sidebar from './Sidebar.vue';
import MainContent from './MainContent.vue';
import Footer from './Footer.vue';

const fullscreen = ref(false);
const activeTab = ref({ id: 'import-map-overrides', name: 'Import Map Overrides', icon: 'mdi:tune' });

const panelClass = computed(() =>
    fullscreen.value
        ? 'w-screen h-screen fixed top-0 left-0 rounded-none shadow-none devtools-panel-fullscreen'
        : 'w-[850px] max-h-[calc(100vh-32px)] fixed bottom-4 right-4 rounded-xl shadow-2xl devtools-panel-compact',
);

const toggleFullscreen = () => {
    fullscreen.value = !fullscreen.value;
};

const setActiveTab = (tab: typeof activeTab.value) => {
    activeTab.value = tab;
};
</script>

<template>
    <div :class="panelClass" id="devtools-panel">
        <Header :fullscreen="fullscreen" @toggle="toggleFullscreen" />
        <div class="flex flex-grow overflow-hidden">
            <Sidebar :activeTab="activeTab" @changeTab="setActiveTab" />
            <MainContent :activeTab="activeTab" />
        </div>
        <Footer />
    </div>
</template>

<style>
#devtools-panel {
    font-family:
        'Inter',
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        Roboto,
        Helvetica,
        Arial,
        sans-serif,
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol';
}
</style>
