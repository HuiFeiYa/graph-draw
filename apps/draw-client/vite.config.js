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
        entry: './electron/main.ts', // 直接指向 TypeScript 源文件
      },
      preload: {
        input: './electron/preload/index.ts', // 直接指向 TypeScript 源文件
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