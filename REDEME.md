## 启动项目

```
pnpm run start
```
## 打包

```shell
# hfdraw\services,生成 dist/main.js 文件
pnpm run build

# apps\draw-client,生成 release 目录
pnpm run build:all
```
打包后，然后复制 apps\draw-client\nodeServer-template 到 apps/draw-client/release/win-unpacked/nodeServer 目录下。替换其中 dist/main.js 文件。

## 添加依赖
在根目录下，将 @hfdraw/utils 依赖添加到 draw-client 项目中
```
pnpm --filter @hfdraw/elbow  i @hfdraw/types
```

在子包下安装其他子包的依赖
```
pnpm add @hfdraw/types --workspace
```