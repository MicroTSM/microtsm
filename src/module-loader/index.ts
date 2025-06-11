interface ImportMap {
    imports: Record<string, string>;
}

const EMPTY_IMPORTMAP = Object.freeze({ imports: {} });

class MicroTSMModuleLoader {
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
        if (!stack.includes('devtools')) {
            throw new Error('ImportMap Overrides can only be set through devtools');
        }

        MicroTSMModuleLoader._importMapOverrides = value;
    }

    private static _importMap: ImportMap['imports'] = {};

    get importMap(): ImportMap['imports'] {
        return MicroTSMModuleLoader._importMap;
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
        specifier =
            MicroTSMModuleLoader._importMapOverrides[specifier] ||
            MicroTSMModuleLoader._importMap[specifier] ||
            specifier;

        const moduleUrl =
            specifier.startsWith('.') || specifier.startsWith('/') ? new URL(specifier, baseUrl).href : specifier;

        if (!moduleUrl) {
            throw new Error(`Module '${specifier}' not found in MicroTSM import map.`);
        }

        const result = await import(moduleUrl);

        if (specifier in MicroTSMModuleLoader._importMap) {
            MicroTSMModuleLoader._moduleLoadTimes[specifier] = performance.now() - startTime;
        }

        return result;
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
