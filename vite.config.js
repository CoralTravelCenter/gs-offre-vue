import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: './appsscript',
        emptyOutDir: false
    },
    plugins: [
        vue(),
        AutoImport({ resolvers: [ElementPlusResolver()], }),
        Components({ resolvers: [ElementPlusResolver()], }),
        viteSingleFile()
    ],
})
