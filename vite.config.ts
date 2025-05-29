import {defineConfig} from 'vite'
import dtsPlugin from "vite-plugin-dts";

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
    plugins: [
        dtsPlugin({'entryRoot': 'src'})
    ],
})
