<script setup lang="ts">
defineEmits(['got-it']);
</script>
<template>
    <div class="fixed inset-0 dialog-overlay items-center flex justify-center p-4" id="devtools-guide-dialog">
        <div class="dialog-content w-full !max-w-lg">
            <div class="dialog-icon-area">
                <span class="material-icons-outlined">help_outline</span>
            </div>
            <div>
                <h3 class="dialog-title">Welcome to MicroTSM DevTools!</h3>
                <p class="dialog-message mt-3 text-left">Here are some helpful shortcuts to get you started:</p>
                <ul class="mt-4 space-y-2 text-sm text-left text-[var(--text-secondary)]">
                    <li>
                        <span class="font-medium text-[var(--text-primary)]">Show/Hide Panel: </span>
                        <span class="keyboard-shortcut">Ctrl</span> + <span class="keyboard-shortcut">`</span>
                    </li>
                    <li>
                        <span class="font-medium text-[var(--text-primary)]">Toggle Fullscreen: </span>
                        <span class="keyboard-shortcut">Ctrl</span> + <span class="keyboard-shortcut">F11</span> or
                        <span class="keyboard-shortcut">Ctrl</span> + <span class="keyboard-shortcut">↑</span> /
                        <span class="keyboard-shortcut">↓</span>
                    </li>
                    <li>
                        <span class="font-medium text-[var(--text-primary)]">Navigate Tabs: </span>
                        <span class="keyboard-shortcut">1</span>, <span class="keyboard-shortcut">2</span>,
                        <span class="keyboard-shortcut">3</span>, <span class="keyboard-shortcut">4</span> or
                        <span class="keyboard-shortcut">Alt</span> + <span class="keyboard-shortcut">↑</span> /
                        <span class="keyboard-shortcut">↓</span> / <span class="keyboard-shortcut">←</span> /
                        <span class="keyboard-shortcut">→</span>
                    </li>
                </ul>
            </div>

            <div class="mt-12 flex justify-end">
                <button
                    class="button-primary cursor-pointer"
                    id="close-devtools-guide-btn"
                    type="button"
                    @click="$emit('got-it')"
                >
                    Got it!
                </button>
            </div>
        </div>
    </div>
</template>

<style>
microtsm-devtools .keyboard-shortcut {
    background-color: var(--surface-elevated);
    border: 1px solid var(--border-neutral);
    border-radius: 4px;
    padding: 2px 6px;
    font-family: 'Roboto Mono', monospace;
    font-size: 0.8em;
    color: var(--text-primary);
    box-shadow: var(--shadow-sm);
}
</style>
