/**
 * Interface representing the structure of import maps configuration.
 */
interface ImportMaps {
    imports: Record<string, string>;
}

/**
 * Injects import maps configuration into the document head as a script tag.
 * The import maps are used to define module specifier remapping for JavaScript imports.
 *
 * @param importMaps - The import maps configuration object
 */
export default function insertImportMaps(importMaps: ImportMaps): void {
    const script = document.createElement('script');
    script.type = 'importmap';
    script.textContent = JSON.stringify(importMaps, null, 2);
    document.head.appendChild(script);
}