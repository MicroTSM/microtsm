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
     */
    async load(specifier: string) {
        specifier = MicroTSMModuleLoader.importMap[specifier] || specifier;
        const stack = new Error().stack || '';
        const callerMatch = stack.match(/https?:\/\/\S+/g);
        const callerUrl = callerMatch ? callerMatch[1] : window.location.href; // Use the first valid URL

        const moduleUrl =
            specifier.startsWith('.') || specifier.startsWith('/') ? new URL(specifier, callerUrl).href : specifier;

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
