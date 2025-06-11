import { defineConfig } from '@microtsm/cli';
import dtsPlugin from 'vite-plugin-dts';
import pkg from './package.json';

const banner = `/**
 * ${pkg.name} v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author.name}
 * @license ${pkg.license}
 */`;

export default defineConfig({
    build: {
        lib: {
            entry: './src/main.ts',
            name: 'microtsm',
            formats: ['es'],
        },
        minify: false,
        rollupOptions: {
            input: {
                'main': './src/main.ts',
                'module-loader': './src/loader/microTSMModuleLoader.ts',
                'devtools/index': './src/devtools/index.ts',
                'devtools/panel': './src/devtools/panel.ts',
            },
            output: {
                banner,
                entryFileNames: '[name].js',
                chunkFileNames: '[name]-[hash].js',
            },
        },
    },
    preview: {
        cors: true,
    },
    plugins: [dtsPlugin({ entryRoot: 'src' })],
});
