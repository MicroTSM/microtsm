/**
 * Defines dynamic import map configuration.
 *
 * Supported formats:
 * - Single file path as string
 * - Multiple file paths as string array
 * - Function taking an environment object and returning file path(s)
 *
 * @example
 * // Single path
 * importMap: './importmap.json'
 *
 * // Multiple paths
 * importMap: ['./dev.importmap.json', './prod.importmap.json']
 *
 * // Dynamic resolution
 * importMap: (env) => env.prod ? './prod.importmap.json': './dev.importmap.json'
 */
export type ImportMapConfig =
    | string
    | string[]
    | ((env: Record<string, any>) => string | string[] | Promise<string | string[]>);

/**
 * Build configuration for a MicroTSM root application.
 *
 * Provides build-time path resolution and asset management settings.
 */
export interface MicroTSMRootAppBuildConfig {
    /**
     * Output directory for build artifacts.
     * @default 'dist'
     */
    outDir?: string;

    /**
     * Import map configuration for JavaScript modules.
     *
     * Files are merged into a single imports.json in <outDir>/importmaps.
     * Supports local file paths and environment-based dynamic resolution.
     *
     * Can also be referenced in the HTML entry file's head section using a <script type="importmap"> tag.
     * See https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap for more details.
     */
    importMap?: ImportMapConfig;

    /**
     * Import map configuration for CSS stylesheets.
     *
     * Follows the same behavior as {@link importMap}, generating a consolidated stylesheets.json.
     *
     * Cannot be referenced with <script type="importmap"> tag.
     * Instead, add a <link> tag in your HTML head section to reference the stylesheets.
     * This option simplifies conditionally setting stylesheet URLs at build time.
     */
    cssImportMap?: ImportMapConfig;

    /**
     * Entry point script for micro-frontend bootstrapping.
     * @default 'src/main.ts'
     */
    entryScript?: string;

    /**
     * Path to the main HTML entry file.
     * @default 'index.html'
     */
    htmlEntry?: string;

    /**
     * Directory for static assets that will be copied during build.
     *
     * Useful for favicons and other static resources.
     * Content is copied as-is and accessible via /public/ path.
     *
     * @example
     * // In index.html:
     * <link rel="icon" href="/public/favicon.ico">
     *
     * @default 'public'
     */
    publicDir?: string;
}