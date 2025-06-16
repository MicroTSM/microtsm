<script setup lang="ts">
import { inject, onMounted, onUnmounted, Ref } from 'vue';
import tabs from './tabs';

const activeTab = defineModel<(typeof tabs)[number]>('activeTab');
const fullScreen = inject<Ref<boolean>>('fullscreen');

onMounted(() => {
    if (!activeTab.value) activeTab.value = tabs[0];
    window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
});

const handleKeyDown = (event: KeyboardEvent) => {
    const key = parseInt(event.key);
    if (key >= 1 && key <= tabs.length) {
        activeTab.value = tabs[key - 1];
    }

    if (event.altKey && (event.key === 'ArrowDown' || event.key === 'ArrowRight')) {
        event.preventDefault();
        const currentIndex = tabs.findIndex((tab) => tab.id === activeTab.value?.id);
        const nextIndex = (currentIndex + 1) % tabs.length;
        activeTab.value = tabs[nextIndex];
    }

    if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowLeft')) {
        debugger;
        event.preventDefault();
        const currentIndex = tabs.findIndex((tab) => tab.id === activeTab.value?.id);
        const prevIndex = currentIndex - 1 < 0 ? tabs.length - 1 : currentIndex - 1;
        activeTab.value = tabs[prevIndex];
    }
};
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
                <span class="tab-label">{{ fullScreen ? tab.shortName : tab.label }}</span>
            </button>
        </nav>
    </aside>
</template>

<style>
microtsm-devtools .tab-active {
    background-color: rgba(0, 0, 0, 0.05) !important;
    color: var(--brand-primary) !important;
    font-weight: 600 !important;
    border-radius: 5px !important;
    box-shadow: none !important;
}

microtsm-devtools .tab-active .material-icons-outlined,
microtsm-devtools .tab-active .material-icons-round {
    color: var(--brand-primary) !important;
}

microtsm-devtools .devtools-panel-compact aside {
    width: max-content !important;
    background-color: var(--surface-elevated) !important;
    border-right: 1px solid var(--border-neutral) !important;
    transition: width 0.3s ease-in-out !important;
}

microtsm-devtools .devtools-panel-compact aside nav button {
    justify-content: center !important;
    padding-left: 6px !important;
    padding-right: 6px !important;
    width: 46px !important;
    height: max-content !important;
    border-radius: 6px !important;
    flex-direction: column !important;
    align-items: center !important;
}

microtsm-devtools .devtools-panel-compact aside nav button .tab-label {
    display: block !important;
    font-size: 0.6rem !important;
    margin-left: 0 !important;
    margin-top: 2px !important;
    opacity: 1 !important;
    transition: opacity 0.3s ease-in-out !important;
    line-height: 1 !important;
}

microtsm-devtools .devtools-panel-compact aside nav button .material-icons-outlined,
microtsm-devtools .devtools-panel-compact aside nav button .material-icons-round {
    font-size: 18px !important;
    line-height: 1.1 !important;
}

microtsm-devtools .devtools-panel-fullscreen aside {
    width: 180px !important;
    flex-shrink: 0 !important;
    padding: 8px !important;
    background-color: var(--surface-elevated) !important;
    border-right: 1px solid var(--border-neutral) !important;
    transition: width 0.3s ease-in-out !important;
}

microtsm-devtools .devtools-panel-fullscreen aside nav button {
    justify-content: flex-start !important;
    height: 36px !important;
    padding: 0 10px !important;
    border-radius: 5px !important;
}

microtsm-devtools .devtools-panel-fullscreen aside nav button:hover {
    background-color: rgba(0, 0, 0, 0.03) !important;
}

microtsm-devtools .devtools-panel-fullscreen aside nav button .tab-label {
    display: inline-block !important;
    margin-left: 12px !important;
    font-size: 0.875rem !important;
    flex-grow: 1 !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    opacity: 1 !important;
    transition: opacity 0.3s ease-in-out !important;
}

microtsm-devtools .devtools-panel-fullscreen aside nav button .material-icons-outlined,
microtsm-devtools .devtools-panel-fullscreen aside nav button .material-icons-round {
    font-size: 18px !important;
    flex-shrink: 0 !important;
}
</style>
