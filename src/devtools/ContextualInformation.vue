<script setup lang="ts">
const baseUrl = 'http://localhost:3000/app/';
const localStorageKey = 'MicroTSM_DEV=1';
</script>

<template>
    <section class="bg-white p-3 rounded-lg shadow">
        <h2 class="text-lg font-semibold text-slate-700 mb-3">Contextual Information</h2>
        <div class="bg-slate-50 p-3 rounded-lg space-y-2 text-sm">
            <div class="flex justify-between"><span class="text-slate-600">Base URL (import.meta.url):</span></div>
            <div class="bg-white p-2 rounded text-xs text-slate-700 truncate">{{ baseUrl }}</div>
            <div class="flex justify-between pt-1"><span class="text-slate-600">Active Local Storage Key:</span></div>
            <div class="bg-white p-2 rounded text-xs text-slate-700 truncate">{{ localStorageKey }}</div>
        </div>
    </section>
</template>
