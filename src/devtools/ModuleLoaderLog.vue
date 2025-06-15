<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue';
import { LoaderLog } from '../module-loader';
import eventBus from '../event-bus';

const logContainer = useTemplateRef<HTMLElement>('logContainer');

onMounted(() => {
    fetchLogs();
    eventBus.on('module-loader:new-log', async () => {
        fetchLogs();
        await nextTick();
        if (logContainer.value) {
            logContainer.value.scrollTop = logContainer.value.scrollHeight;
        }
    });
});

onUnmounted(() => {
    eventBus.off('module-loader:new-log', fetchLogs);
});

/**
 * [
 *     { type: 'info', message: 'MicroTSM DevTools activated.' },
 *     {
 *         type: 'load',
 *         message: 'Module @microtsm/core requested.',
 *         url: 'https://cdn.jsdelivr.net/npm/@microtsm/core@1.2.3/dist/index.js',
 *     },
 *     { type: 'load', message: 'Module @microtsm/core loaded in 120ms.' },
 *     { type: 'warn', message: 'Override for @microtsm/utils', url: 'http://localhost:8081/utils.js' },
 *     { type: 'error', message: 'Failed to load module @microtsm/ui-components: NetworkError.', trace: '#' },
 * ]
 */
const logs = ref<LoaderLog[]>([]);

const typeClasses = {
    info: 'text-sky-300',
    load: 'text-cyan-300',
    warn: 'text-yellow-200',
    error: 'text-red-400',
};

const fetchLogs = () => {
    logs.value = [...window.MicroTSM.logs];
};

const showTrace = (e: MouseEvent, log: LoaderLog) => {
    if (e.target instanceof HTMLAnchorElement && !e.target.parentElement?.querySelector('.error-stack-trace')) {
        e.target.parentElement!.insertAdjacentHTML(
            'beforeend',
            `<pre class="error-stack-trace text-red-400 ml-4">${log.trace}</pre>`,
        );
    }
};
</script>

<template>
    <section class="tab-pane active grid grid-rows-[max-content,1fr] h-full" id="tab-content-module-loader-log">
        <div class="flex justify-between items-center mb-3">
            <h2 class="section-title">Module Loader Logs</h2>
        </div>

        <div class="log-container" ref="logContainer">
            <div class="log-wrapper">
                <p v-for="log in logs" :key="log.message">
                    <span :class="typeClasses[log.type as keyof typeof typeClasses]"
                        >[{{ log.type.toUpperCase() }}]</span
                    >
                    {{ log.message }}
                    <span v-if="log.data?.moduleOverrideUrl" class="text-yellow-300">{{
                        log.data.moduleOverrideUrl
                    }}</span>
                    <a
                        v-if="log.trace"
                        class="text-sky-400 underline hover:text-sky-600 cursor-pointer"
                        @click="showTrace($event, log)"
                    >
                        View stack trace
                    </a>
                </p>
            </div>
        </div>
    </section>
</template>

<style>
.log-container {
    background-color: #ffffff;
    padding: 12px;
    border-radius: 6px;
    border: 1px solid var(--border-neutral);
    overflow-y: auto;
    max-height: max-content;
  scroll-behavior: smooth;
}

.log-wrapper {
    color: #1e1e1e;
    font-family: 'SF Mono', 'Menlo', 'Courier New', monospace;
    font-size: 0.8125rem;
    height: max-content;
    line-height: 1.6;
}

.log-container p .text-sky-300 {
    color: #50e3c2;
}

.log-container p .text-cyan-300 {
    color: #4a90e2;
}

.log-container p .text-yellow-300 {
    color: #f5a623;
}

.log-container p .text-purple-300 {
    color: #bd10e0;
}

.log-container p .text-yellow-200 {
    color: #f8e71c;
}

.log-container p .text-red-300 {
    color: #d0021b;
}

.log-container p a {
    color: var(--brand-primary);
}

.log-container p a:hover {
    text-decoration: underline;
}
</style>
