<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

interface Module {
    name: string;
    originalUrl: string;
    overrideUrl: string;
    status: string;
    loadTime?: string;
    persisted?: boolean;
}

const persistedIcon = 'mdi:content-save-check-outline';
const notPersistedIcon = 'mdi:alert-circle-outline';

onMounted(() => {
    const { importMap, importMapOverrides, moduleLoadTimes } = window.MicroTSM;
    modules.value = Object.keys(importMap)
        .reduce(
            (map, name) => {
                map[name] = {
                    name,
                    originalUrl: importMap[name],
                    overrideUrl: importMapOverrides[name] || '',
                    loadTime: isModuleLoaded(name) ? `${moduleLoadTimes[name]}ms` : '-',
                    status: getModuleLoadingsStatus(name),
                };

                return map;
            },
            {} as Record<string, Module>,
        )
        .valueOf() as Module[];
});

const searchTerm = ref('');
const persistedStatus = computed(() => {
    if (modules.value.some((m) => !m.persisted))
        return {
            message: 'Changes Not Persisted',
            icon: 'mdi:alert-circle-outline',
            class: 'bg-yellow-100 text-yellow-700',
        };

    return {
        message: 'Overrides Persisted',
        icon: 'mdi:content-save-check-outline',
        class: 'bg-green-100 text-green-700',
    };
});

const modules = ref<Module[]>([]);

const filteredModules = computed(() =>
    modules.value.filter(
        (m) =>
            m.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            m.originalUrl.toLowerCase().includes(searchTerm.value.toLowerCase()),
    ),
);

const isModuleLoaded = (name: string) => {
    return !!document.querySelector(`microtsm-application[name="${name}"]`);
};

const getModuleLoadingsStatus = (name: string) => {
    if (isModuleLoaded(name) && window.MicroTSM.moduleLoadTimes[name] == undefined) return 'Pending';
    else if (window.MicroTSM.errorLoadedModules.includes(name)) return 'Error';
    return isModuleLoaded(name) ? 'Loaded' : 'Not Loaded';
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Loaded':
            return 'mdi:check-circle-outline';
        case 'Pending':
            return 'mdi:timer-sand';
        case 'Error':
            return 'mdi:alert-circle-outline';
        case 'Not Loaded':
            return 'mdi:clock-outline';
    }
};

const saveOverride = (index: number) => {
    const { overrideUrl, name } = modules.value[index];
    window.MicroTSM.importMapOverrides = {
        ...window.MicroTSM.importMapOverrides,
        [name]: overrideUrl,
    };
};

const resetOverride = (index: number) => {
    modules.value[index].overrideUrl = '';
    const { name } = modules.value[index];
    window.MicroTSM.importMapOverrides = {
        ...window.MicroTSM.importMapOverrides,
        [name]: '',
    };
};

defineExpose({ persistedStatus });
</script>

<template>
    <div class="relative mb-3">
        <iconify-icon
            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base"
            icon="mdi:magnify"
        ></iconify-icon>
        <input
            class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors text-sm"
            v-model="searchTerm"
            placeholder="Search modules by name or domain..."
            type="text"
        />
    </div>
    <div class="table-container rounded-lg border border-slate-200">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 sticky top-0 z-10">
                <tr
                    v-for="column in ['Module Name', 'Original URL', 'Override URL', 'Load Time', 'Status', 'Actions']"
                    :key="column"
                >
                    <th
                        class="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                        scope="col"
                    >
                        {{ column }}
                    </th>
                </tr>
            </thead>

            <tbody class="bg-white divide-y divide-slate-200" id="modules-tbody">
                <tr v-for="(module, index) of filteredModules" :key="module.name">
                    <td class="table-cell text-slate-700 font-medium">{{ module.name }}</td>
                    <td class="table-cell text-xs max-w-[100px] truncate" :title="module.originalUrl">
                        {{ module.originalUrl }}
                    </td>
                    <td class="table-cell">
                        <input
                            v-model="module.overrideUrl"
                            class="w-full px-2 py-1.5 border border-slate-300 rounded-md outline-none transition-colors text-xs"
                        />
                    </td>
                    <td class="table-cell text-slate-500">{{ module.loadTime ?? '-' }}</td>
                    <td class="table-cell">
                        <span
                            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                            :class="{
                                'bg-green-100 text-green-700': module.status === 'Loaded',
                                'bg-yellow-100 text-yellow-700': module.status === 'Pending',
                                'bg-red-100 text-red-700': module.status === 'Error',
                                'bg-slate-100 text-slate-700': module.status === 'Not Loaded',
                            }"
                        >
                            <iconify-icon :icon="getStatusIcon(module.status)" class="text-sm mr-1"></iconify-icon>
                            {{ module.status }}
                        </span>
                    </td>
                    <td class="table-cell space-x-1.5">
                        <button @click="saveOverride(index)" class="text-sky-600 hover:text-sky-800">
                            <iconify-icon
                                :icon="module.persisted ? persistedIcon : notPersistedIcon"
                                class="text-lg"
                            ></iconify-icon>
                        </button>

                        <button @click="resetOverride(index)" class="text-slate-500 hover:text-slate-700">
                            <iconify-icon icon="mdi:undo" class="text-lg"></iconify-icon>
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style>
@reference "tailwindcss";

.table-container {
    max-height: 300px;
    overflow-y: auto;
}

.table-cell {
    @apply px-3 py-2.5 whitespace-nowrap;
}
</style>
