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
    <section class="bg-white p-3 rounded-lg shadow">
        <h2 class="text-lg font-semibold text-slate-700 mb-3">Performance Metrics</h2>
        <div class="bg-slate-50 p-3 rounded-lg space-y-2 text-sm">
            <div class="flex justify-between">
                <span class="text-slate-600">Total Modules Loaded:</span>
                <span class="font-medium text-slate-800">{{ totalModulesLoaded }} / {{ totalModules }}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-slate-600">Overall Load Time:</span>
                <span class="font-medium text-slate-800">{{ overallLoadTime }}ms</span>
            </div>
            <div class="flex justify-between">
                <span class="text-slate-600">Average Load Time:</span>
                <span class="font-medium text-slate-800">{{ averageLoadTime }}ms</span>
            </div>
        </div>
    </section>
</template>
