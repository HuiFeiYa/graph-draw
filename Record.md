## 打包 nest 项目无法启动
[参考](https://juejin.cn/post/7065724860688760862)

错误: Error: Cannot find module '@nestjs/core' 等等报错

解决：将 nest 中 node_modules 复制到 apps\draw-client\nodeServer\node_modules 目录，保证能找到对应依赖。

## electron 中启动 nest better-sqlite3 报错

错误：
> node error: [Nest] 21656  - 2024/12/04 09:15:09   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (2)...
Error: The module '\\?\D:\sourcecode\draw\hfdraw\apps\draw-client\nodeServer\node_modules\better-sqlite3\build\Release\better_sqlite3.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 115. This version of Node.js requires
NODE_MODULE_VERSION 130. Please try re-compiling or re-installing

解决：
1. 在 nest 中添加 electron-rebuild 依赖
2. 将 package.json 以及 dist 文件复制到 hfdraw\apps\draw-client\nodeServer 目录下
3. 在 hfdraw\apps\draw-client\nodeServer 目录下执行 ./node_modules/.bin/electron-rebuild 重新编译。 electron-rebuild 会重新编译所有需要编译的本地模块。这一步骤会生成与当前 Electron 版本兼容的 .node 文件。
4. 再次启动 electron 项目成功。


## graph 中打印 enums 枚举为 undefined

console.log('EventType.SHAPE_MOUSE_OVER:',EventType.SHAPE_MOUSE_OVER)

需要重新到 types 目录下 npm run build 。


## 项目中多版本 node
使用 volta 管理
```JSON
  "volta": {
    "node": "20.18.0"
  },
```