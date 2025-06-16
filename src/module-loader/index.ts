import eventBus from '../event-bus';
import { default as MicroTSMRootApp } from '../app/microTSMRootApp.ts';
import type { App } from 'vue';

interface ImportMap {
    imports: Record<string, string>;
}

export interface LoaderLog {
    type: 'info' | 'warn' | 'load' | 'error';
    message: string;
    data?: {
        moduleOverrideUrl?: string;
    };
    trace?: string;
}

const EMPTY_IMPORTMAP = Object.freeze({ imports: {} });

class MicroTSMModuleLoader {
    static _loadingModules = new Map<string, boolean>();
    static _devtoolsInstance: { mount: () => void; unmount: App['unmount'] };
    version = __VERSION__;

    constructor() {
        if (window.MicroTSM) {
            return window.MicroTSM;
        }

        // Locate the custom import map script
        const importMapElement: HTMLScriptElement | null = document.querySelector('script[type="microtsm-importmap"]');
        if (!importMapElement) {
            throw new Error(
                'No microtsm importmap script found. To work with MicroTSM dynamic imports' +
                    'you must include a <script type="microtsm-importmap"> element in your HTML.',
            );
        }

        const importMap = importMapElement.textContent;
        // Parse its content as JSON. The structure should follow the "imports" pattern.
        const importMapData: ImportMap = importMap ? JSON.parse(importMap) : EMPTY_IMPORTMAP;
        MicroTSMModuleLoader._importMap = importMapData.imports;

        if (localStorage.getItem('devtoolsEnabled') === 'true') {
            this.installDevTools();
        }

        window.MicroTSM = this;
        this.bindDevToolsShortcut();
    }

    static _rootApp: MicroTSMRootApp;

    public get rootApp(): MicroTSMRootApp {
        return MicroTSMModuleLoader._rootApp;
    }

    public set rootApp(value: MicroTSMRootApp) {
        if (!new Error().stack?.includes('MicroTSMRootApp')) {
            throw new Error('rootApp can only be set by MicroTSMRootApp class');
        }

        MicroTSMModuleLoader._rootApp = value;
    }

    private static _logs: LoaderLog[] = [];

    get logs(): LoaderLog[] {
        return MicroTSMModuleLoader._logs;
    }

    static _errorLoadedModules: string[] = [];

    get errorLoadedModules(): string[] {
        return MicroTSMModuleLoader._errorLoadedModules;
    }

    set errorLoadedModules(value: string[]) {
        MicroTSMModuleLoader._errorLoadedModules = value;
    }

    static _moduleLoadTimes: Record<string, number> = {};

    get moduleLoadTimes(): Record<string, number> {
        return MicroTSMModuleLoader._moduleLoadTimes;
    }

    private static _importMapOverrides: ImportMap['imports'] = JSON.parse(
        localStorage.getItem('importMapOverrides') || '{}',
    );

    get importMapOverrides(): ImportMap['imports'] {
        return MicroTSMModuleLoader._importMapOverrides;
    }

    set importMapOverrides(value: ImportMap['imports']) {
        const stack = new Error().stack || '';
        if (!stack.includes('devtools') && !stack.includes('ImportMapOverrides')) {
            throw new Error('ImportMap Overrides can only be set through devtools');
        }

        MicroTSMModuleLoader._importMapOverrides = value;
        localStorage.setItem('importMapOverrides', JSON.stringify(value));
    }

    private static _importMap: ImportMap['imports'] = {};

    get importMap(): ImportMap['imports'] {
        return MicroTSMModuleLoader._importMap;
    }

    enableDevTools() {
        if (!localStorage.devtoolsEnabled) {
            localStorage.devtoolsEnabled = true;
            this.installDevTools().then();
        } else {
            console.warn('DevTools already enabled');
        }
    }

    disableDevTools() {
        delete localStorage.devtoolsEnabled;
        this.uninstallDevTools();
    }

    pushLogs(value: LoaderLog) {
        MicroTSMModuleLoader._logs.push(value);
        eventBus.emit('module-loader:new-log', value);
    }

    getModuleStatus(module: string): 'Idle' | 'Loading' | 'Loaded' | 'Error' {
        if (MicroTSMModuleLoader._loadingModules.has(module)) return 'Loading';
        return MicroTSMModuleLoader._moduleLoadTimes[module] !== undefined
            ? 'Loaded'
            : MicroTSMModuleLoader._errorLoadedModules.includes(module)
              ? 'Error'
              : 'Idle';
    }

    /**
     * Dynamically imports a module using the stored import map.
     * @param {string} specifier - The bare module specifier.
     *
     * Note: In Safari, 'import' cannot be used as a method name, so we use 'load' instead.
     * @param baseUrl - The base URL to use when resolving relative URLs.
     */
    async load(specifier: string, baseUrl = import.meta.url): Promise<any> {
        const startTime = performance.now();

        const moduleSpecifier = // Resolved module specifier from importmap
            MicroTSMModuleLoader._importMapOverrides[specifier] ||
            MicroTSMModuleLoader._importMap[specifier] ||
            specifier;

        const moduleUrl =
            moduleSpecifier.startsWith('.') || moduleSpecifier.startsWith('/') // Relative URL
                ? new URL(moduleSpecifier, baseUrl).href
                : moduleSpecifier;

        if (!moduleUrl) {
            const message = `Module ${specifier} not found in MicroTSM import map.`;
            this.pushLogs({ type: 'error', message });
            throw new Error(message);
        }

        eventBus.emit('module-loader:load-requested', { module: specifier, url: moduleUrl });
        this.pushLogs({ type: 'load', message: `Module ${specifier} requested from ${moduleUrl}` });
        MicroTSMModuleLoader._loadingModules.set(specifier, true);

        try {
            const result = await import(moduleUrl);
            const loadTime = Number((performance.now() - startTime).toFixed(2));

            if (specifier in MicroTSMModuleLoader._importMap) {
                MicroTSMModuleLoader._moduleLoadTimes[specifier] = loadTime;
            }

            eventBus.emit('module-loader:module-loaded', { module: specifier, loadTime });
            this.pushLogs({ type: 'load', message: `Module ${specifier} loaded in ${loadTime}ms` });

            return result;
        } catch (error: any) {
            MicroTSMModuleLoader._errorLoadedModules.push(specifier);
            this.pushLogs({
                type: 'error',
                message: `Failed to load module ${specifier}: ${error}`,
                trace: error.stack,
            });
            eventBus.emit('module-loader:load-error', { module: specifier, error });
            throw error;
        } finally {
            MicroTSMModuleLoader._loadingModules.delete(specifier);
        }
    }

    unload(specifier: string) {
        delete MicroTSMModuleLoader._moduleLoadTimes[specifier];
        MicroTSMModuleLoader._errorLoadedModules = MicroTSMModuleLoader._errorLoadedModules.filter(
            (m) => m !== specifier,
        );
    }

    private async installDevTools() {
        const { showIndicator } = await import('../devtools/devtoolsCustomElement.js');
        showIndicator();

        import('../devtools/index.js').then((module) => {
            MicroTSMModuleLoader._devtoolsInstance = module;
            module.mount();
            this.pushLogs({ type: 'info', message: 'MicroTSM DevTools activated.' });
        });
    }

    private uninstallDevTools() {
        MicroTSMModuleLoader._devtoolsInstance?.unmount();
    }

    private bindDevToolsShortcut() {
        // Listen for keydown events globally
        document.addEventListener('keydown', (event) => {
            switch (true) {
                case event.ctrlKey && event.key === 'F12':
                case event.altKey && event.key.toLowerCase() === 'd':
                    event.preventDefault();
                    if (localStorage.devtoolsEnabled) this.disableDevTools();
                    else this.enableDevTools();
                    break;
            }
        });
    }
}

new MicroTSMModuleLoader();

declare global {
    interface Window {
        MicroTSM: MicroTSMModuleLoader;
    }
}

declare const __VERSION__: string;
