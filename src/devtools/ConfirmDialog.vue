<script setup lang="ts">
import { ref } from 'vue';
import eventBus from '../event-bus';

const showDialog = ref(false);
const icon = ref('help_outline');
const title = ref('Confirm Action');
const showCheckbox = ref(false);
const dontShowAgain = ref(false);
const message = ref('Are you sure you want to proceed?');

const onConfirm = ref(() => {});
const onCancel = () => {
    showDialog.value = false;
};

eventBus.on('devtools:confirm-action', (e) => {
    if (document.cookie.includes(`dontShow_${e.id}=true`)) {
        return e.onConfirm();
    }

    dontShowAgain.value = false;
    title.value = e.title;
    message.value = e.message;
    onConfirm.value = () => {
        if (dontShowAgain.value && e.id) {
            document.cookie = `dontShow_${e.id}=true; path=/; max-age=31536000`;
        }

        e.onConfirm();
        showDialog.value = false;
    };
    icon.value = e.icon ?? 'help_outline';
    showCheckbox.value = e.showCheckbox ?? true;
    showDialog.value = true;
});
</script>

<template>
    <div
        v-show="showDialog"
        class="fixed inset-0 dialog-overlay flex items-center justify-center p-4 z-50"
        id="confirm-dialog"
    >
        <div class="dialog-content w-full">
            <div class="dialog-icon-area">
                <span class="material-icons-outlined">{{ icon }}</span>
            </div>
            <div>
                <h3 class="dialog-title" id="confirm-dialog-title">{{ title }}</h3>
                <p v-html="message" class="dialog-message mt-2" id="confirm-dialog-message" />
            </div>

            <div class="mt-5 flex items-center justify-center" v-if="showCheckbox">
                <input
                    class="mr-2"
                    id="dont-show-again"
                    name="dont-show-again"
                    type="checkbox"
                    v-model="dontShowAgain"
                />
                <label class="dialog-checkbox-label" for="dont-show-again">Don't show this again</label>
            </div>

            <div class="mt-6 flex justify-center gap-3">
                <button class="button-secondary" id="confirm-dialog-cancel" type="button" @click="onCancel">
                    Cancel
                </button>
                <button class="button-primary" id="confirm-dialog-confirm" type="button" @click="onConfirm">
                    Confirm
                </button>
            </div>
        </div>
    </div>
</template>

<style>
microtsm-devtools .dialog-overlay {
    background-color: var(--surface-overlay) !important;
    z-index: 2147483648 !important;
}

microtsm-devtools .dialog-content {
    background-color: #fdfdfd !important;
    border-radius: 12px !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
    padding: 24px !important;
    border: none !important;
    min-width: 200px !important;
    max-width: 360px !important;
}

microtsm-devtools .dialog-title {
    font-size: 1.125rem !important;
    font-weight: 600 !important;
    color: var(--text-primary) !important;
    line-height: 1.3 !important;
    text-align: center !important;
}

microtsm-devtools .dialog-message {
    font-size: 0.875rem !important;
    color: var(--text-secondary) !important;
    margin-top: 12px !important;
    line-height: 1.5 !important;
    text-align: center !important;
}

microtsm-devtools .dialog-icon-area {
    margin-bottom: 16px !important;
    display: flex !important;
    justify-content: center !important;
}

microtsm-devtools .dialog-icon-area .material-icons-outlined {
    font-size: 28px !important;
    color: var(--brand-primary) !important;
}

microtsm-devtools .dialog-checkbox-label {
    font-size: 0.875rem !important;
    color: var(--text-primary) !important;
}

microtsm-devtools input[type='checkbox'] {
    border-radius: 4px !important;
    border: 1px solid #bdbdbd !important;
    color: var(--brand-primary) !important;
    background-color: #ffffff !important;
    width: 18px !important;
    height: 18px !important;
    appearance: none !important;
    position: relative !important;
    cursor: pointer !important;
    vertical-align: middle !important;
    margin-top: -2px !important;
}

microtsm-devtools input[type='checkbox']:checked {
    background-color: var(--brand-primary) !important;
    border-color: var(--brand-primary) !important;
}

microtsm-devtools input[type='checkbox']:checked::before {
    content: 'check' !important;
    font-family: 'Material Icons Round', sans-serif !important;
    font-size: 14px !important;
    color: var(--text-on-brand) !important;
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    font-weight: bold !important;
}

microtsm-devtools input[type='checkbox']:focus {
    outline: none !important;
    border-color: var(--brand-primary) !important;
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.25) !important;
}

microtsm-devtools .button-primary {
    background-color: var(--brand-primary) !important;
    color: var(--text-on-brand) !important;
    font-weight: 500 !important;
    font-size: 0.875rem !important;
    padding: 6px 16px !important;
    border-radius: 6px !important;
    transition: background-color 0.1s ease-in-out !important;
    height: 32px !important;
    text-transform: none !important;
    letter-spacing: normal !important;
    border: none !important;
}

microtsm-devtools .button-primary:hover {
    background-color: #0070dd !important;
}

microtsm-devtools .button-primary:active {
    background-color: #005cbf !important;
}

microtsm-devtools .button-secondary {
    background-color: #e9e9eb !important;
    color: var(--text-primary) !important;
    font-weight: 500 !important;
    font-size: 0.875rem !important;
    padding: 6px 16px !important;
    border-radius: 6px !important;
    border: 1px solid #d1d1d6 !important;
    transition:
        background-color 0.1s ease-in-out,
        border-color 0.1s ease !important;
    height: 32px !important;
    text-transform: none !important;
    letter-spacing: normal !important;
}

microtsm-devtools .button-secondary:hover {
    background-color: #dddee0 !important;
    border-color: #c6c6c9 !important;
}

microtsm-devtools .button-secondary:focus {
    border-color: var(--brand-primary) !important;
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.25) !important;
    outline: none !important;
}

microtsm-devtools .button-secondary:active {
    background-color: #d2d3d5 !important;
    border-color: #b8b8bb !important;
}
</style>
