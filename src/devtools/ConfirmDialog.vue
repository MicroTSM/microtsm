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
