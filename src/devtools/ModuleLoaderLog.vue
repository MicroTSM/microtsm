<script setup lang="ts">
import { ref } from 'vue';

const logs = ref([
    { type: 'info', message: 'MicroTSM DevTools activated.' },
    {
        type: 'load',
        message: 'Module @microtsm/core requested.',
        url: 'https://cdn.jsdelivr.net/npm/@microtsm/core@1.2.3/dist/index.js',
    },
    { type: 'load', message: 'Module @microtsm/core loaded in 120ms.' },
    { type: 'warn', message: 'Override for @microtsm/utils', url: 'http://localhost:8081/utils.js' },
    { type: 'error', message: 'Failed to load module @microtsm/ui-components: NetworkError.', trace: '#' },
]);

const typeClasses = {
    info: 'text-sky-400',
    load: 'text-green-400',
    warn: 'text-yellow-400',
    error: 'text-red-400',
};
</script>

<template>
    <section class="bg-white p-3 rounded-lg shadow">
        <h2 class="text-lg font-semibold text-slate-700 mb-3">Module Loader Debug Log</h2>
        <div class="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs max-h-48 overflow-y-auto">
            <p v-for="log in logs" :key="log.message">
                <span :class="typeClasses[log.type as keyof typeof typeClasses]">[{{ log.type.toUpperCase() }}]</span>
                {{ log.message }}
                <span v-if="log.url" class="text-yellow-300">{{ log.url }}</span>
                <a v-if="log.trace" class="text-sky-400 underline hover:text-sky-300" :href="log.trace">
                    View stack trace
                </a>
            </p>
        </div>
    </section>
</template>
