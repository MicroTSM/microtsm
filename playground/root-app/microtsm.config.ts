import { defineRootAppConfig } from '@microtsm/cli';

export default defineRootAppConfig({
    cssImportMap: ['src/importmaps/stylesheets.json'],
    importMap: ['src/importmaps/core-importmap.json', 'src/importmaps/modules-importmap.json'],
    moduleLoader: 'http://localhost:4174/module-loader/index.js',
});
