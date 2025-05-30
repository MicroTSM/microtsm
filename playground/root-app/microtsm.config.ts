import {defineConfig} from "microtsm";

export default defineConfig({
    cssImportMap: ['src/stylesheets.json'],
    importMap: ['src/importmaps/core-importmap.json', 'src/importmaps/modules-importmap.json']
});
