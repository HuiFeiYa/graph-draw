

1. **`"build": "vite build"`**:
   - 这个命令使用 Vite 构建工具来构建项目。Vite 是一个现代前端构建工具，它利用浏览器原生 ES 模块导入特性提供快速的冷启动和热更新。这个命令通常用于生成生产环境的静态资源文件。

2. **`"build:all": "pnpm run build-ts & vite build && pnpm run electron:build"`**:
   - 这个命令是一个复合命令，它首先运行 `build-ts` 来编译 TypeScript 代码，然后使用 Vite 构建项目，最后运行 `electron:build` 来打包 Electron 应用。
   - `&` 符号用于并行运行命令，`&&` 符号用于顺序运行命令，只有前一个命令成功时才执行后一个命令。

3. **`"start": "vite dev "`**:
   - 这个命令启动 Vite 的开发服务器，用于本地开发和调试。它提供了快速的模块热替换（HMR）功能，使得开发过程中可以即时看到更改效果。

4. **`"dev": "vite dev & electron --inspect=5858 ."`**:
   - 这个命令同时启动 Vite 的开发服务器和 Electron 应用。`electron --inspect=5858 .` 命令启动 Electron 应用，并开启 Chrome DevTools 进行调试，调试端口为 5858。
   - `&` 符号使得两个命令并行运行。

5. **`"electron:build": "electron-builder"`**:
   - 这个命令使用 `electron-builder` 工具来打包 Electron 应用。`electron-builder` 是一个流行的 Electron 打包工具，支持多种平台和配置选项。

6. **`"rebuild": "electron-rebuild -f -w better-sqlite3"`**:
   - 这个命令使用 `electron-rebuild` 工具来重新编译原生模块。`electron-rebuild` 是一个用于在 Electron 应用中重新编译原生模块（如 `node-gyp` 模块）的工具。
   - `-f` 选项强制重新编译所有模块，`-w better-sqlite3` 指定只编译 `better-sqlite3` 模块。

7. **`"build-ts": "tsc"`**:
   - 这个命令使用 TypeScript 编译器（`tsc`）来编译项目中的 TypeScript 代码。TypeScript 是 JavaScript 的一个超集，它添加了类型系统和其他特性，以提高代码的可维护性和可读性。
