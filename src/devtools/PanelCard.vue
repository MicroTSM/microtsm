<script setup lang="ts">
defineProps<{
    tab: { id: string; name: string };
}>();
</script>

<template>
    <div class="tab-pane" :id="tab.id">
        <section>
            <div class="bg-white p-3 rounded-lg shadow">
                <div class="flex justify-between items-center mb-3">
                    <h2 class="text-lg font-semibold text-slate-700">{{ tab.name }}</h2>
                    <slot name="title-addon"></slot>
                </div>
                <slot></slot>
            </div>
        </section>
    </div>
</template>
