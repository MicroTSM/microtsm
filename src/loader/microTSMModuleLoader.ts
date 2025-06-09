interface ImportMap {
    imports: Record<string, string>;
}

const EMPTY_IMPORTMAP = Object.freeze({ imports: {} });

class MicroTSMModuleLoader {
    static importMap: ImportMap['imports'] = {};

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
        MicroTSMModuleLoader.importMap = Object.freeze(importMapData.imports);

        window.MicroTSM = this;
    }

    /**
     * Dynamically imports a module using the stored import map.
     * @param {string} specifier - The bare module specifier.
     *
     * Note: In Safari, 'import' cannot be used as a method name, so we use 'load' instead.
     * @param baseUrl - The base URL to use when resolving relative URLs.
     */
    async load(specifier: string, baseUrl = import.meta.url): Promise<any> {
        specifier = MicroTSMModuleLoader.importMap[specifier] || specifier;
        const moduleUrl =
            specifier.startsWith('.') || specifier.startsWith('/') ? new URL(specifier, baseUrl).href : specifier;

        if (!moduleUrl) {
            throw new Error(`Module '${specifier}' not found in MicroTSM import map.`);
        }

        return import(moduleUrl);
    }
}

new MicroTSMModuleLoader();

declare global {
    interface Window {
        MicroTSM: MicroTSMModuleLoader;
    }
}
