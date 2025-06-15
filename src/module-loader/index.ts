import eventBus from '../event-bus';

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

// TODO: add enableDevtools method
class MicroTSMModuleLoader {
    static _loadingModules = new Map<string, boolean>();

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

        window.MicroTSM = this;
    }

    private static _logs: LoaderLog[] = [{ type: 'info', message: 'MicroTSM DevTools activated.' }];

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

    private static _importMapOverrides: ImportMap['imports'] = {};

    get importMapOverrides(): ImportMap['imports'] {
        return MicroTSMModuleLoader._importMapOverrides;
    }

    set importMapOverrides(value: ImportMap['imports']) {
        const stack = new Error().stack || '';
        if (!stack.includes('devtools') && !stack.includes('ImportMapOverrides')) {
            throw new Error('ImportMap Overrides can only be set through devtools');
        }

        MicroTSMModuleLoader._importMapOverrides = value;
    }

    private static _importMap: ImportMap['imports'] = {};

    get importMap(): ImportMap['imports'] {
        return MicroTSMModuleLoader._importMap;
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
        const moduleUrl =
            specifier.startsWith('.') || specifier.startsWith('/') // Relative URL
                ? new URL(specifier, baseUrl).href
                : MicroTSMModuleLoader._importMapOverrides[specifier] ||
                  MicroTSMModuleLoader._importMap[specifier] ||
                  specifier;

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
}

new MicroTSMModuleLoader();

declare global {
    interface Window {
        MicroTSM: MicroTSMModuleLoader;
    }
}
