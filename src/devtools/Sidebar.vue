<script setup lang="ts">
import { inject, onMounted, Ref } from 'vue';

const tabs = [
    { id: 'import-map-overrides', name: 'Import Map Overrides', label: 'Overrides', icon: 'tune' },
    { id: 'module-loader-log', name: 'Module Loader Log', label: 'Log', icon: 'description' },
    { id: 'performance-metrics', name: 'Performance Metrics', label: 'Perf', icon: 'speed' },
    { id: 'contextual-information', name: 'Contextual Info', label: 'Context', icon: 'info' },
];

const activeTab = defineModel<(typeof tabs)[number]>('activeTab');
const fullScreen = inject<Ref<boolean>>('fullscreen');

onMounted(() => {
    if (!activeTab.value) activeTab.value = tabs[0];
});
</script>

<template>
    <aside class="border-r border-[var(--border-neutral)] p-1.5 bg-[var(--surface-elevated)]">
        <nav class="space-y-1">
            <button
                v-for="tab in tabs"
                :class="[
                    'w-full flex items-center px-2.5 py-2.5 text-left text-sm font-medium text-[var(--text-secondary)]',
                    'hover:bg-[rgba(0,0,0,0.03)] rounded-[5px] transition-colors duration-150',
                    {
                        'tab-active': tab.id === activeTab?.id,
                    },
                ]"
                :data-tab="tab.id"
                @click="activeTab = tab"
            >
                <span class="material-icons-outlined text-lg">{{ tab.icon }}</span>
                <span class="tab-label">{{ tab.label }}</span>
            </button>
        </nav>
    </aside>
</template>

<style>
.tab-active {
    background-color: rgba(0, 0, 0, 0.05) !important;
    color: var(--brand-primary) !important;
    font-weight: 600;
    border-radius: 5px;
    box-shadow: none;
}

.tab-active .material-icons-outlined,
.tab-active .material-icons-round {
    color: var(--brand-primary) !important;
}

.devtools-panel-compact aside {
    width: 56px;
    background-color: var(--surface-elevated);
    border-right: 1px solid var(--border-neutral);
    transition: width 0.3s ease-in-out;
}

.devtools-panel-compact aside nav button {
    justify-content: center;
    padding-left: 0;
    padding-right: 0;
    height: 48px;
    border-radius: 5px;
    flex-direction: column;
    align-items: center;
}

.devtools-panel-compact aside nav button .tab-label {
    display: block;
    font-size: 0.6rem;
    margin-left: 0;
    margin-top: 2px;
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
}

.devtools-panel-compact aside nav button .material-icons-outlined,
.devtools-panel-compact aside nav button .material-icons-round {
    font-size: 18px;
}

.devtools-panel-fullscreen aside {
    width: 220px;
    padding: 8px;
    background-color: var(--surface-elevated);
    border-right: 1px solid var(--border-neutral);
    transition: width 0.3s ease-in-out;
}

.devtools-panel-fullscreen aside nav button {
    justify-content: flex-start;
    height: 36px;
    padding: 0 10px;
    border-radius: 5px;
}

.devtools-panel-fullscreen aside nav button:hover {
    background-color: rgba(0, 0, 0, 0.03);
}

.devtools-panel-fullscreen aside nav button .tab-label {
    display: inline-block;
    margin-left: 12px;
    font-size: 0.875rem;
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
}

.devtools-panel-fullscreen aside nav button .material-icons-outlined,
.devtools-panel-fullscreen aside nav button .material-icons-round {
    font-size: 18px;
    flex-shrink: 0;
}
</style>
