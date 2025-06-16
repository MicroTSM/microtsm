<script setup lang="ts">
const version = window.MicroTSM.version;
</script>

<template>
    <footer class="bg-slate-100 text-slate-500 p-2.5 text-xs text-center border-t border-slate-200">
        MicroTSM Developer Tools v{{ version }} © 2025. For development use only.
    </footer>
</template>

<style>
microtsm-devtools .footer {
    background-color: var(--surface-elevated) !important;
    color: var(--text-tertiary) !important;
    border-top: 1px solid var(--border-neutral) !important;
    padding: 6px 14px !important;
    height: 30px !important;
    font-size: 0.75rem !important;
    text-align: center !important;
    transition: border-radius 0.3s ease-in-out !important;
}
</style>
