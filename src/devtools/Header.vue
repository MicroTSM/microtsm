<script setup lang="ts">
import { defineEmits, defineProps } from 'vue';

defineProps<{ fullscreen: boolean }>();
const emit = defineEmits(['toggle']);

const closePanel = () => {
    document.getElementById('devtools-panel')!.style.display = 'none';
};
</script>

<template>
    <header class="bg-slate-800 text-white p-3 flex items-center justify-between" fullscreen>
        <div class="flex items-center gap-2">
            <iconify-icon icon="ic:outline-build-circle" width="24" height="24"></iconify-icon>
            <h3 class="text-md font-semibold">MicroTSM Developer Tools</h3>
        </div>
        <div class="flex items-center gap-1">
            <button
                title="Toggle Fullscreen"
                class="text-white hover:bg-slate-700 p-1 h-[26px] rounded-full"
                @click="emit('toggle')"
            >
                <iconify-icon
                    class="text-lg"
                    :icon="fullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'"
                ></iconify-icon>
            </button>
            <button
                title="Close Panel"
                class="text-white hover:bg-slate-700 p-1 h-[26px] rounded-full"
                @click="closePanel"
            >
                <iconify-icon class="text-lg" icon="mdi:close"></iconify-icon>
            </button>
        </div>
    </header>
</template>
