<script setup lang="ts">
import { defineEmits, defineProps } from 'vue';

const tabs = [
    { id: 'import-map-overrides', name: 'Import Map Overrides', icon: 'mdi:tune' },
    { id: 'module-loader-log', name: 'Module Loader Log', icon: 'mdi:file-document-outline' },
    { id: 'performance-metrics', name: 'Performance Metrics', icon: 'ic:outline-speed' },
    { id: 'contextual-information', name: 'Contextual Info', icon: 'mdi:information-outline' },
];

defineProps<{ activeTab: (typeof tabs)[number] }>();
const emit = defineEmits<{
    changeTab: [tab: (typeof tabs)[number]];
}>();
</script>

<template>
    <aside class="bg-slate-50 border-r border-slate-200 p-1 transition-all duration-300 ease-in-out">
        <nav class="space-y-0.5">
            <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="emit('changeTab', tab)"
                class="w-full flex items-center gap-3 px-3 py-2 text-left text-sm font-medium hover:bg-slate-100 rounded-md border-l-4 border-transparent transition-colors duration-150"
                :class="activeTab.id === tab.id ? 'tab-active' : 'border-transparent text-slate-700'"
            >
                <iconify-icon class="text-lg" :icon="tab.icon"></iconify-icon>
                <span class="tab-label">{{ tab.name }}</span>
            </button>
        </nav>
    </aside>
</template>

<style>
.tab-active {
    border-left-color: #0ea5e9;
    background-color: #f0f9ff;
    color: #0ea5e9;
}

.devtools-panel-compact aside {
    width: 3.5rem;
}

.devtools-panel-compact aside nav button {
    justify-content: center;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    height: 2.5rem;
}

.devtools-panel-compact aside nav button .tab-label {
    display: none;
}

.devtools-panel-fullscreen aside {
    width: 20%;
}

.devtools-panel-fullscreen aside nav button {
    justify-content: flex-start;
    height: 2.5rem;
}

.devtools-panel-fullscreen aside nav button .tab-label {
    display: inline;
}
</style>
