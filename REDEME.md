## 启动项目

```
pnpm run start
```
## 打包

```
hfdraw\services： pnpm run build
apps\draw-client： pnpm run build:all
```
## 添加依赖
在根目录下，将 @hfdraw/utils 依赖添加到 draw-client 项目中
```
pnpm --filter @hfdraw/elbow  i @hfdraw/types
```

在子包下安装其他子包的依赖
```
pnpm add @hfdraw/types --workspace
```