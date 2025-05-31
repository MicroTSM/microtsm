import { defineConfig } from '@microtsm/cli';
import dtsPlugin from 'vite-plugin-dts';

export default defineConfig({
    build: {
        lib: {
            entry: './src/main.ts',
            name: 'microtsm',
            formats: ['es'],
            fileName: 'main',
        },
        minify: false,
    },
    plugins: [dtsPlugin({ entryRoot: 'src' })],
});
