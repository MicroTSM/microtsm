<script setup lang="ts">
const version = window.MicroTSM.version;
</script>

<template>
    <footer class="bg-slate-100 text-slate-500 p-2.5 text-xs text-center border-t border-slate-200">
        MicroTSM Developer Tools v{{ version }} © 2025. For development use only.
    </footer>
</template>

<style>
.footer {
    background-color: var(--surface-elevated);
    color: var(--text-tertiary);
    border-top: 1px solid var(--border-neutral);
    padding: 6px 14px;
    height: 30px;
    font-size: 0.75rem;
    text-align: center;
    transition: border-radius 0.3s ease-in-out;
}
</style>
