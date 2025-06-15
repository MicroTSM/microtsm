<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import eventBus, { MicroTSMEventMap } from '../event-bus';

interface Module {
    name: string;
    originalUrl: string;
    overrideUrl: string;
    status: string;
    loadTime?: string;
    persisted?: boolean;
    temporaryOverrideUrl: string;
}

onMounted(() => {
    const { importMap, importMapOverrides, moduleLoadTimes } = window.MicroTSM;
    modules.value = Object.values(
        Object.keys(importMap).reduce(
            (map, name) => {
                map[name] = {
                    name,
                    originalUrl: importMap[name],
                    overrideUrl: importMapOverrides[name] || '',
                    temporaryOverrideUrl: importMapOverrides[name] || '',
                    loadTime: moduleLoadTimes[name] != null ? `${moduleLoadTimes[name]}ms` : '-',
                    status: window.MicroTSM.getModuleStatus(name),
                    persisted: true,
                };

                return map;
            },
            {} as Record<string, Module>,
        ),
    );

    eventBus.on('module-loader:load-error', loadErrorHandler);
    eventBus.on('module-loader:load-requested', loadRequestedHandler);
    eventBus.on('module-loader:module-loaded', moduleLoadedHandler);
});

onUnmounted(() => {
    eventBus.off('module-loader:load-error', loadErrorHandler);
    eventBus.off('module-loader:load-requested', loadRequestedHandler);
    eventBus.off('module-loader:module-loaded', moduleLoadedHandler);
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

const allPersisted = computed(() => modules.value.every((m) => m.persisted));

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Loaded':
            return 'check_circle';
        case 'Pending':
            return 'hourglass_empty';
        case 'Error':
            return 'error';
        case 'Idle':
            return 'watch_later';
    }
};

const onBeforeSaveOverride = (event: MouseEvent, module: Module, index: number) => {
    const target = event.target as HTMLElement;
    const dialogId = `saveOverride`;

    eventBus.emit('devtools:confirm-action', {
        id: dialogId,
        title: 'Save Override',
        message: `Save override for <strong>${module.name}</strong> to:
<code class="text-xs bg-gray-100 p-1 rounded inline-flex w-max my-1">${module.temporaryOverrideUrl || '(cleared)'}</code>?`,
        onConfirm: () => {
            const saveIcon = target.tagName === 'SPAN' ? target : target?.querySelector('span');

            if (saveIcon) {
                saveIcon.textContent = 'check';
                saveIcon.classList.add('text-[var(--status-success-text)]');
                target.classList.remove('text-[var(--brand-primary)]');
                setTimeout(() => {
                    saveIcon.textContent = 'save';
                    saveIcon.classList.remove('text-[var(--status-success-text)]');
                    target.classList.add('text-[var(--brand-primary)]');
                }, 1500);
            }

            saveOverride(index);
        },
    });
};

const saveOverride = (index: number) => {
    const { temporaryOverrideUrl, name } = modules.value[index];
    window.MicroTSM.importMapOverrides = {
        ...window.MicroTSM.importMapOverrides,
        [name]: temporaryOverrideUrl,
    };

    modules.value[index].overrideUrl = temporaryOverrideUrl;
    modules.value[index].persisted = true;
};

const onBeforeResetOverrides = (_: MouseEvent, module: Module, index: number) => {
    const dialogId = `resetOverride`;
    eventBus.emit('devtools:confirm-action', {
        id: dialogId,
        title: 'Reset Override',
        message: `Reset override for <strong>${module.name}</strong>? This will clear any custom URL.`,
        onConfirm: () => resetOverride(index),
    });
};
const resetOverride = (index: number) => {
    modules.value[index].overrideUrl = '';
    modules.value[index].temporaryOverrideUrl = '';
    modules.value[index].persisted = true;
    const { name } = modules.value[index];
    window.MicroTSM.importMapOverrides = {
        ...window.MicroTSM.importMapOverrides,
        [name]: '',
    };
};

const changed = (module: Module) => {
    return module.overrideUrl !== module.temporaryOverrideUrl;
};

const overridden = (module: Module) => {
    return module.overrideUrl !== '';
};

const onInputOverrides = (module: Module) => {
    module.persisted = !changed(module);
};

const loadErrorHandler = ({ module }: MicroTSMEventMap['module-loader:load-error']) => {
    const matchedModule = modules.value.find((m) => m.name === module);
    if (matchedModule) {
        matchedModule.status = 'Error';
    }
};

const loadRequestedHandler = ({ module }: MicroTSMEventMap['module-loader:load-requested']) => {
    const matchedModule = modules.value.find((m) => m.name === module);
    if (matchedModule) {
        matchedModule.status = 'Pending';
    }
};

const moduleLoadedHandler = ({ module, loadTime }: MicroTSMEventMap['module-loader:module-loaded']) => {
    const matchedModule = modules.value.find((m) => m.name === module);
    if (matchedModule) {
        matchedModule.status = 'Loaded';
        matchedModule.loadTime = `${loadTime}ms`;
    }
};

defineExpose({ persistedStatus });
</script>

<template>
    <section class="tab-pane active" id="tab-content-import-map-overrides">
        <div class="flex justify-between items-center mb-3">
            <h2 class="section-title">Import Map Overrides</h2>
            <span
                :class="[
                    'status-badge',
                    {
                        'status-badge-green': allPersisted,
                        'status-badge-yellow': !allPersisted,
                    },
                ]"
                id="persisted-status"
            >
                <span class="material-icons-round text-sm">{{ allPersisted ? 'save' : 'warning' }}</span
                >{{ allPersisted ? 'Overrides Persisted' : 'Changes Not Persisted' }}
            </span>
        </div>

        <div class="search-input-container mb-3">
            <span class="material-icons-outlined">search</span>
            <input
                class="w-full"
                id="search-modules-input"
                v-model="searchTerm"
                placeholder="Search modules by name or url..."
                type="search"
            />
        </div>
        <div class="table-container">
            <table class="min-w-full">
                <thead>
                    <tr>
                        <th scope="col">Module Name</th>
                        <th scope="col">Original URL</th>
                        <th scope="col">Override URL</th>
                        <th class="w-24" scope="col">Load Time</th>
                        <th class="w-32" scope="col">Status</th>
                        <th class="w-28 text-center" scope="col">Actions</th>
                    </tr>
                </thead>

                <tbody id="modules-tbody">
                    <tr v-for="(module, index) of filteredModules" :key="module.name">
                        <td class="font-medium text-[var(--text-primary)]">{{ module.name }}</td>
                        <td
                            class="text-xs max-w-[120px] truncate text-[var(--text-tertiary)]"
                            :title="module.originalUrl"
                        >
                            {{ module.originalUrl }}
                        </td>
                        <td>
                            <input
                                class="module-override-url w-full"
                                placeholder="Enter override URL"
                                type="url"
                                v-model="module.temporaryOverrideUrl"
                                @input="onInputOverrides(module)"
                            />
                        </td>
                        <td class="text-[var(--text-tertiary)] text-xs">{{ module.loadTime ?? '-' }}</td>
                        <td>
                            <span
                                class="status-badge"
                                :class="{
                                    'status-badge-green': module.status === 'Loaded',
                                    'status-badge-yellow': module.status === 'Pending',
                                    'status-badge-red': module.status === 'Error',
                                    'status-badge-gray': module.status === 'Not Loaded',
                                }"
                            >
                                <span class="material-icons-round text-sm">{{ getStatusIcon(module.status) }}</span>
                                {{ module.status }}
                            </span>
                        </td>
                        <td class="text-center space-x-1.5">
                            <button
                                :disabled="!changed(module)"
                                :class="[
                                    'icon-button text-[var(--brand-primary)]',
                                    {
                                        'opacity-60': !changed(module),
                                    },
                                ]"
                                :title="!changed(module) ? 'No Changes to Save' : 'Save Override'"
                                @click="onBeforeSaveOverride($event, module, index)"
                            >
                                <span class="material-icons-outlined text-base">save</span>
                            </button>
                            <button
                                :class="[
                                    'icon-button',
                                    {
                                        'opacity-60': !overridden(module),
                                    },
                                ]"
                                :disabled="!overridden(module)"
                                title="Reset to Default"
                                @click="onBeforeResetOverrides($event, module, index)"
                            >
                                <span class="material-icons-outlined text-base">undo</span>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>
</template>

<style>
#tab-content-import-map-overrides {
    display: grid;
    grid-template-rows: max-content max-content 1fr;
    height: 100%;
}

.search-input-container {
    position: relative;
}

.search-input-container .material-icons-outlined {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-tertiary);
    font-size: 16px;
}

.search-input-container input[type='search'] {
    padding-left: 34px;
}

.table-container {
    max-height: max-content;
    overflow-y: auto;
    border: 1px solid var(--border-neutral);
    border-radius: 6px;
    background-color: var(--surface-base);
    scroll-behavior: smooth;
}

table {
    font-size: 0.875rem;
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
}

th {
    background-color: var(--table-header-bg);
    color: var(--text-secondary);
    font-weight: 500;
    text-transform: none;
    letter-spacing: normal;
    padding: 10px 12px;
    border-bottom: 1px solid var(--border-neutral);
    text-align: left;
    position: sticky;
    top: 0;
    z-index: 1;
}

th:first-child {
    border-top-left-radius: 0;
}

th:last-child {
    border-top-right-radius: 0;
}

td {
    color: var(--text-primary);
    padding: 8px 12px;
    border-bottom: 1px solid #eaeaea;
    background-color: var(--surface-base);
    height: auto;
}

tbody tr:last-child td {
    border-bottom: none;
}

tbody tr:hover td {
    background-color: #f0f6ff;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    border: 1px solid transparent;
}

.status-badge-green {
    background-color: var(--status-success-bg);
    color: var(--status-success-text);
}

.status-badge-yellow {
    background-color: var(--status-warning-bg);
    color: var(--status-warning-text);
}

.status-badge-red {
    background-color: var(--status-error-bg);
    color: var(--status-error-text);
}

.status-badge-gray {
    background-color: #e5e5ea;
    color: #3c3c43;
}

.status-badge .material-icons-outlined,
.status-badge .material-icons-round {
    font-size: 14px;
    margin-right: 5px;
}

input[type='text'],
input[type='url'],
input[type='search'] {
    background-color: var(--surface-base);
    border: 1px solid #c6c6c6;
    border-radius: 6px;
    padding: 7px 10px;
    font-size: 0.875rem;
    color: var(--text-primary);
    transition:
        border-color 0.15s ease-in-out,
        box-shadow 0.15s ease-in-out;
    appearance: none;
    height: 32px;
}

input[type='text']::placeholder,
input[type='url']::placeholder,
input[type='search']::placeholder {
    color: var(--text-placeholder);
}

input[type='text']:focus,
input[type='url']:focus,
input[type='search']:focus {
    border-color: var(--border-focused);
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.25);
    outline: none;
}

.module-override-url {
    font-size: 0.8125rem;
    background-color: transparent;
    border: none;
    padding: 3px;
    color: var(--text-primary);
    width: 100%;
    border-radius: 4px;
}

.module-override-url:focus {
    outline: none;
    background-color: var(--status-info-bg);
    box-shadow: 0 0 0 2px var(--brand-primary);
}
</style>
