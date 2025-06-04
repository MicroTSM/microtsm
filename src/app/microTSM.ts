interface ImportMap {
    imports: Record<string, string>;
}

const EMPTY_IMPORTMAP = Object.freeze({ imports: {} });

export default class MicroTSM {
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
        MicroTSM.importMap = Object.freeze(importMapData.imports);

        window.MicroTSM = this;
    }

    /**
     * Dynamically imports a module using the stored import map.
     * @param {string} specifier - The bare module specifier.
     */
    async import(specifier: string): Promise<any> {
        const moduleUrl = MicroTSM.importMap[specifier] || specifier;
        if (!moduleUrl) {
            return Promise.reject(new Error(`Module "${specifier}" not found in the MicroTSM import map.`));
        }

        // Delegate to dynamic import(); the browser handles caching.
        return import(moduleUrl);
    }
}

declare global {
    interface Window {
        MicroTSM: MicroTSM;
    }
}
