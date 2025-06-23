## 启动项目
打包类型文件，用于 esm 和 cmj 两种格式的类型文件。

```
cd packages/types

pnpm run build
```

## 添加依赖
在根目录下，将 @hfdraw/utils 依赖添加到 draw-client 项目中
```
pnpm --filter @hfdraw/elbow  i @hfdraw/types
```

## 在子包下安装其他子包的依赖

pnpm add @hfdraw/types --workspace