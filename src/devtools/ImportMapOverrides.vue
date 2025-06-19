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
const changesNeedRelaunch = ref<boolean>(false);

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

const onBeforeSaveOverride = (event: Event, module: Module) => {
    event.preventDefault();
    const target = event.target as HTMLElement;
    const dialogId = `saveOverride`;

    eventBus.emit('devtools:confirm-action', {
        id: dialogId,
        title: 'Save Override',
        message: `Save override for <strong>${module.name}</strong> to:
<code class="text-xs bg-gray-100 p-1 rounded inline-flex w-max my-1">${module.temporaryOverrideUrl || '(cleared)'}</code>?`,
        onConfirm: () => {
            const saveIcon = target.closest('tr')?.querySelector('.save-override .material-icons-outlined');

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

            saveOverride(module);
        },
    });
};

const saveOverride = (module: Module) => {
    const { temporaryOverrideUrl, name } = module;
    window.MicroTSM.importMapOverrides = {
        ...window.MicroTSM.importMapOverrides,
        [name]: temporaryOverrideUrl,
    };

    module.overrideUrl = temporaryOverrideUrl;
    module.persisted = true;
    changesNeedRelaunch.value = true;
};

const onBeforeResetOverrides = (_: MouseEvent, module: Module) => {
    const dialogId = `resetOverride`;
    eventBus.emit('devtools:confirm-action', {
        id: dialogId,
        title: 'Reset Override',
        message: `Reset override for <strong>${module.name}</strong>? This will clear any custom URL.`,
        onConfirm: () => resetOverride(module),
    });
};

const resetOverride = (module: Module) => {
    module.overrideUrl = '';
    module.temporaryOverrideUrl = '';
    module.persisted = true;
    const { name } = module;
    window.MicroTSM.importMapOverrides = {
        ...window.MicroTSM.importMapOverrides,
        [name]: '',
    };
    changesNeedRelaunch.value = true;
};

const relaunchApp = () => {
    if (window.MicroTSM && window.MicroTSM.rootApp && typeof window.MicroTSM.rootApp.relaunch === 'function') {
        window.MicroTSM.rootApp.relaunch();
        changesNeedRelaunch.value = false;
    } else {
        console.warn('Relaunch function not available.');
        alert('Relaunch function (window.MicroTSM.rootApp.relaunch) is not available.');
    }
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
            <div class="flex items-center gap-1.5">
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
                    <span class="material-icons-round text-sm">
                        {{ allPersisted ? 'save' : 'warning' }}
                    </span>
                    {{ allPersisted ? 'Overrides Persisted' : 'Changes Not Persisted' }}
                </span>
                <button class="icon-button relative" id="relaunch-app-btn" title="Relaunch App" @click="relaunchApp">
                    <span class="material-icons-outlined text-base">refresh</span>
                    <span class="relaunch-btn-indicator" v-show="changesNeedRelaunch" id="relaunch-button-indicator" />
                </button>
            </div>
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
                    <tr v-for="module of filteredModules" :key="module.name">
                        <td class="font-medium text-[var(--text-primary)]">{{ module.name }}</td>
                        <td
                            class="text-xs max-w-[120px] truncate text-[var(--text-tertiary)]"
                            :title="module.originalUrl"
                        >
                            {{ module.originalUrl }}
                        </td>
                        <td>
                            <form
                                :id="`override-url-form-${module.name}`"
                                @submit="onBeforeSaveOverride($event, module)"
                            >
                                <input
                                    name="override-url"
                                    class="module-override-url w-full"
                                    placeholder="Enter override URL"
                                    type="url"
                                    pattern="https?://.+"
                                    v-model="module.temporaryOverrideUrl"
                                    @input="onInputOverrides(module)"
                                />
                            </form>
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
                                    'save-override',
                                    'icon-button text-[var(--brand-primary)]',
                                    {
                                        'opacity-60': !changed(module),
                                    },
                                ]"
                                :title="!changed(module) ? 'No Changes to Save' : 'Save Override'"
                                type="submit"
                                :form="`override-url-form-${module.name}`"
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
                                @click="onBeforeResetOverrides($event, module)"
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
microtsm-devtools #tab-content-import-map-overrides {
    display: grid !important;
    grid-template-rows:
        max-content
        max-content 1fr !important;
    height: 100% !important;
}

microtsm-devtools .search-input-container {
    position: relative !important;
}

microtsm-devtools .search-input-container .material-icons-outlined {
    position: absolute !important;
    left: 10px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    color: var(--text-tertiary) !important;
    font-size: 16px !important;
}

microtsm-devtools .search-input-container input[type='search'] {
    padding-left: 34px !important;
}

microtsm-devtools .table-container {
    max-height: max-content !important;
    overflow-y: auto !important;
    border: 1px solid var(--border-neutral) !important;
    border-radius: 6px !important;
    background-color: var(--surface-base) !important;
    scroll-behavior: smooth !important;
}

microtsm-devtools table {
    font-size: 0.875rem !important;
    border-collapse: separate !important;
    border-spacing: 0 !important;
    width: 100% !important;
}

microtsm-devtools th {
    background-color: var(--table-header-bg) !important;
    color: var(--text-secondary) !important;
    font-weight: 500 !important;
    text-transform: none !important;
    letter-spacing: normal !important;
    padding: 10px 12px !important;
    border-bottom: 1px solid var(--border-neutral) !important;
    text-align: left !important;
    position: sticky !important;
    top: 0 !important;
    z-index: 1 !important;
}

microtsm-devtools th:first-child {
    border-top-left-radius: 0 !important;
}

microtsm-devtools th:last-child {
    border-top-right-radius: 0 !important;
}

microtsm-devtools td {
    color: var(--text-primary) !important;
    padding: 8px 12px !important;
    border-bottom: 1px solid #eaeaea !important;
    background-color: var(--surface-base) !important;
    height: auto !important;
}

microtsm-devtools tbody tr:last-child td {
    border-bottom: none !important;
}

microtsm-devtools tbody tr:hover td {
    background-color: #f0f6ff !important;
}

microtsm-devtools .status-badge {
    display: inline-flex !important;
    align-items: center !important;
    padding: 3px 8px !important;
    border-radius: 12px !important;
    font-size: 0.75rem !important;
    font-weight: 500 !important;
    border: 1px solid transparent !important;
}

microtsm-devtools .status-badge-green {
    background-color: var(--status-success-bg) !important;
    color: var(--status-success-text) !important;
}

microtsm-devtools .status-badge-yellow {
    background-color: var(--status-warning-bg) !important;
    color: var(--status-warning-text) !important;
}

microtsm-devtools .status-badge-red {
    background-color: var(--status-error-bg) !important;
    color: var(--status-error-text) !important;
}

microtsm-devtools .status-badge-gray {
    background-color: #e5e5ea !important;
    color: #3c3c43 !important;
}

microtsm-devtools .status-badge .material-icons-outlined,
microtsm-devtools .status-badge .material-icons-round {
    font-size: 14px !important;
    margin-right: 5px !important;
}

microtsm-devtools input[type='text'],
microtsm-devtools input[type='url'],
microtsm-devtools input[type='search'] {
    background-color: var(--surface-base) !important;
    border: 1px solid #c6c6c6 !important;
    border-radius: 6px !important;
    padding: 7px 10px !important;
    font-size: 0.875rem !important;
    color: var(--text-primary) !important;
    transition:
        border-color 0.15s ease-in-out,
        box-shadow 0.15s ease-in-out !important;
    appearance: none !important;
    height: 32px !important;
}

microtsm-devtools input[type='text']::placeholder,
microtsm-devtools input[type='url']::placeholder,
microtsm-devtools input[type='search']::placeholder {
    color: var(--text-placeholder) !important;
}

microtsm-devtools input[type='text']:focus,
microtsm-devtools input[type='url']:focus,
microtsm-devtools input[type='search']:focus {
    border-color: var(--border-focused) !important;
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.25) !important;
    outline: none !important;
}

microtsm-devtools .module-override-url {
    font-size: 0.8125rem !important;
    background-color: transparent !important;
    border: none !important;
    padding: 3px !important;
    color: var(--text-primary) !important;
    width: 100% !important;
    border-radius: 4px !important;
}

microtsm-devtools .module-override-url:focus {
    outline: none !important;
    background-color: var(--status-info-bg) !important;
    box-shadow: 0 0 0 2px var(--brand-primary) !important;
}

microtsm-devtools .relaunch-indicator .material-icons-outlined {
    font-size: 16px !important;
    margin-right: 6px !important;
    vertical-align: text-bottom !important;
}

microtsm-devtools .relaunch-btn-indicator {
    position: absolute !important;
    top: -4px !important;
    right: -4px !important;
    width: 10px !important;
    height: 10px !important;
    background-color: var(--status-warning-text) !important;
    border-radius: 50% !important;
    border: 2px solid var(--surface-elevated) !important;
}
</style>
