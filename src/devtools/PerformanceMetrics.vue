<script setup lang="ts">
import { computed } from 'vue';

const totalModules = Object.keys(window.MicroTSM.importMap).length;
const totalModulesLoaded = computed(() => Object.keys(window.MicroTSM.moduleLoadTimes).length);
const overallLoadTime = computed(() =>
    Object.values(window.MicroTSM.moduleLoadTimes).reduce((acc, loadTime) => acc + loadTime || 0, 0),
);

const averageLoadTime = computed(() =>
    totalModulesLoaded.value ? Math.round(overallLoadTime.value / totalModulesLoaded.value) : 0,
);
</script>

<template>
    <section class="tab-pane active" id="tab-content-performance-metrics">
        <h2 class="section-title mb-3">Performance Metrics</h2>
        <div class="info-card space-y-3">
            <div class="flex justify-between items-center">
                <span class="text-[var(--text-secondary)] text-sm">Total Modules Loaded:</span>
                <span class="font-medium text-[var(--text-primary)] text-sm"
                    >{{ totalModulesLoaded }} / {{ totalModules }}</span
                >
            </div>
            <hr class="border-[var(--border-neutral)]" />
            <div class="flex justify-between items-center">
                <span class="text-[var(--text-secondary)] text-sm">Overall Load Time:</span>
                <span class="font-medium text-[var(--text-primary)] text-sm">{{ overallLoadTime }}ms</span>
            </div>
            <hr class="border-[var(--border-neutral)]" />
            <div class="flex justify-between items-center">
                <span class="text-[var(--text-secondary)] text-sm">Average Load Time:</span>
                <span class="font-medium text-[var(--text-primary)] text-sm">{{ averageLoadTime }}ms</span>
            </div>
        </div>
    </section>
</template>
