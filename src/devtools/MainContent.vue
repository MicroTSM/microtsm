<script setup lang="ts">
import { defineProps } from 'vue';
import ImportMapOverrides from './ImportMapOverrides.vue';
import ModuleLoaderLog from './ModuleLoaderLog.vue';
import PerformanceMetrics from './PerformanceMetrics.vue';
import ContextualInformation from './ContextualInformation.vue';
import PanelCard from './PanelCard.vue';

defineProps<{ activeTab: { id: string; name: string } }>();
</script>

<template>
    <main class="w-3/4 p-3 flex-grow overflow-y-auto">
        <PanelCard :tab="activeTab">
            <template #title-addon>
                <span
                    v-if="activeTab.id === 'import-map-overrides'"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"
                    id="persisted-status"
                >
                    <iconify-icon class="text-base mr-1" icon="mdi:content-save-check-outline"></iconify-icon>
                    Overrides Persisted
                </span>
            </template>

            <ImportMapOverrides v-if="activeTab.id === 'import-map-overrides'" />
            <ModuleLoaderLog v-if="activeTab.id === 'module-loader-log'" />
            <PerformanceMetrics v-if="activeTab.id === 'performance-metrics'" />
            <ContextualInformation v-if="activeTab.id === 'contextual-information'" />
        </PanelCard>
    </main>
</template>
