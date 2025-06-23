import { defineConfig } from '@microtsm/cli';
import dtsPlugin from 'vite-plugin-dts';
import pkg from './package.json';
import pluginVue from '@vitejs/plugin-vue';

const banner = (entry: string) => `/**
 * ${pkg.name}${entry != 'main' ? '/' + entry.replace('/index', '') : ''} v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author.name}
 * @license ${pkg.license}
 */`;

export default defineConfig({
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
        '__VERSION__': JSON.stringify(pkg.version),
    },
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
                'module-loader/index': './src/module-loader/index.ts',
                'devtools/index': './src/devtools/index.ts',
            },
            output: {
                banner: ({ name, isEntry }) => (isEntry && banner(name)) || undefined,
                entryFileNames: '[name].js',
                chunkFileNames: '[name]-[hash].js',
                manualChunks: (id) => {
                    const folderMatch = id.match(/src\/([^/]+)\//);
                    const fileMatch = id.match(/[^/]+\.ts$/i);
                    const isVueFile = id.includes('.vue');
                    if (folderMatch && fileMatch && !isVueFile) {
                        const fileName = fileMatch[0].replace('.ts', '');
                        return `${folderMatch[1]}/${fileName}`;
                    }

                    return null;
                },
            },
        },
    },
    preview: {
        cors: true,
        port: 4174,
    },
    server: {
        port: 4174,
    },
    plugins: [dtsPlugin({ entryRoot: 'src' }), pluginVue()],
});
