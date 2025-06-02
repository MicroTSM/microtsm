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
            fileName: 'main',
        },
        minify: false,
        rollupOptions: {
            output: {
                banner,
            },
        },
    },
    plugins: [dtsPlugin({ entryRoot: 'src' })],
});
