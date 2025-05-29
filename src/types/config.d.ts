/**
 * A type that allows for dynamic configuration of import maps.
 *
 * It can be:
 * - A static ImportMap object.
 * - A single path (string) or an array of paths indicating where the import map file(s) can be loaded from.
 * - A function that, given an environment object, returns (or resolves to) an ImportMap, a string, or an array of strings.
 */
export type ImportMapConfig =
    | ImportMap
    | string
    | string[]
    | ((
    env: Record<string, any>
) => ImportMap | string | string[] | Promise<ImportMap | string | string[]>);

/**
 * The configuration interface for the MicroTSM root.
 *
 * This configuration lets you:
 * - Define import maps dynamically (via a static value, file path(s), or a resolver function).
 * - Specify the entry root script file (e.g. "main.ts") that bootstraps your micro‑frontend application.
 * - Specify the path to your index HTML file.
 * - Configure a layout for the application.
 * - Define the public directory containing static assets to be copied over during build.
 */
export interface MicroTSMRootConfig {
    /**
     * Import map configuration.
     *
     * You can provide:
     * - A static ImportMap object.
     * - A single path (or an array of paths) to an import map file (relative or absolute).
     * - A function that accepts an environment object and returns one of the above.
     */
    importMap?: ImportMapConfig;

    /**
     * The path for the entry root script file (e.g. "main.ts").
     *
     * This file serves as the bootstrap for your micro‑frontend application.
     */
    entryScript: string;

    /**
     * The path to the index HTML file.
     *
     * This file provides the main HTML structure of your application.
     */
    indexHtml: string;

    /**
     * Layout configuration for your micro‑frontend.
     *
     * The layout can be used to configure persistent components (such as headers or footers)
     * and the container that holds your route‑dependent micro‑applications.
     */
    layout?: {
        /**
         * The path to load the layout.
         *
         * This can be a local file or a URL.
         */
        path: string;
    };

    /**
     * The public directory to be copied during the build process.
     *
     * This directory contains static assets (e.g., images, styles, additional HTML files)
     * that should be available as-is in your production build.
     */
    publicDir?: string;
}