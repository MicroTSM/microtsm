<script setup lang="ts">
import { defineProps } from 'vue';
import ImportMapOverrides from './ImportMapOverrides.vue';
import ModuleLoaderLog from './ModuleLoaderLog.vue';
import PerformanceMetrics from './PerformanceMetrics.vue';
import ContextualInformation from './ContextualInformation.vue';

defineProps<{ activeTab: { id: string; name: string } }>();
</script>

<template>
    <main class="flex-grow p-4 bg-[var(--surface-base)] overflow-y-auto">
        <ImportMapOverrides v-if="activeTab.id === 'import-map-overrides'" />
        <ModuleLoaderLog v-if="activeTab.id === 'module-loader-log'" />
        <PerformanceMetrics v-if="activeTab.id === 'performance-metrics'" />
        <ContextualInformation v-if="activeTab.id === 'contextual-information'" />
    </main>
</template>
