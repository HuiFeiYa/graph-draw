import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron/simple';
import { resolve } from 'path';
console.log("resolve(__dirname, 'src')",resolve(__dirname, 'src'))
export default defineConfig({
  build: {
    outDir: 'dist-app', // 明确指定不同于dist的目录
  },
  plugins: [
    vue(),
    electron({
      main: {
        entry: './dist-a/main.js',
        // vite: {
        //   build: {
        //     outDir: 'dist-electron/main', // 主进程输出目录
        //     rollupOptions: { /* 自定义配置 */ }
        //   }
        // }
      },
      preload: {
        input: './dist-a/preload/index.js',
        outDir: 'dist-electron',
        esbuildPluginOptions: {
          target: 'es2020',
        },
      },
    }),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // 设置 @ 别名指向 src 目录
    },
  }
});