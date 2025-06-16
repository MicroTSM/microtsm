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

            <div class="mt-6 flex justify-center space-x-3">
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
.dialog-overlay {
    background-color: var(--surface-overlay);
    z-index: 2147483648;
}

.dialog-content {
    background-color: #fdfdfd;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    padding: 24px;
    border: none;
    min-width: 200px;
    max-width: 360px;
}

.dialog-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.3;
    text-align: center;
}

.dialog-message {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 12px;
    line-height: 1.5;
    text-align: center;
}

.dialog-icon-area {
    margin-bottom: 16px;
    display: flex;
    justify-content: center;
}

.dialog-icon-area .material-icons-outlined {
    font-size: 28px;
    color: var(--brand-primary);
}

.dialog-checkbox-label {
    font-size: 0.875rem;
    color: var(--text-primary);
}

input[type='checkbox'] {
    border-radius: 4px;
    border: 1px solid #bdbdbd;
    color: var(--brand-primary);
    background-color: #ffffff;
    width: 18px;
    height: 18px;
    appearance: none;
    position: relative;
    cursor: pointer;
    vertical-align: middle;
    margin-top: -2px;
}

input[type='checkbox']:checked {
    background-color: var(--brand-primary);
    border-color: var(--brand-primary);
}

input[type='checkbox']:checked::before {
    content: 'check';
    font-family: 'Material Icons Round', sans-serif;
    font-size: 14px;
    color: var(--text-on-brand);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: bold;
}

input[type='checkbox']:focus {
    outline: none;
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.25);
}

.button-primary {
    background-color: var(--brand-primary);
    color: var(--text-on-brand);
    font-weight: 500;
    font-size: 0.875rem;
    padding: 6px 16px;
    border-radius: 6px;
    transition: background-color 0.1s ease-in-out;
    height: 32px;
    text-transform: none;
    letter-spacing: normal;
    border: none;
}

.button-primary:hover {
    background-color: #0070dd;
}

.button-primary:active {
    background-color: #005cbf;
}

.button-secondary {
    background-color: #e9e9eb;
    color: var(--text-primary);
    font-weight: 500;
    font-size: 0.875rem;
    padding: 6px 16px;
    border-radius: 6px;
    border: 1px solid #d1d1d6;
    transition:
        background-color 0.1s ease-in-out,
        border-color 0.1s ease;
    height: 32px;
    text-transform: none;
    letter-spacing: normal;
}

.button-secondary:hover {
    background-color: #dddee0;
    border-color: #c6c6c9;
}

.button-secondary:focus {
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.25);
    outline: none;
}

.button-secondary:active {
    background-color: #d2d3d5;
    border-color: #b8b8bb;
}
</style>
