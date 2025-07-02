const path = require('path');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: path.resolve(__dirname, './src/main.ts'),
  target: 'node',
  mode: 'production',
  externals: [
    // 排除 node_modules 中的所有依赖，但保留 better-sqlite3
    nodeExternals({
      allowlist: [
        'better-sqlite3', 
        'sqlite3',
        'reflect-metadata', // 新增：包含 reflect-metadata
        /^@nestjs\/.*$/,      // 包含 NestJS 相关模块
        /^typeorm\/.*$/,  
        'tslib',
      ], // 明确允许这两个模块被打包
       // 排除uid包及其依赖
       whitelist: ['uid'] // 若报错，可尝试移除whitelist
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true, // 加快编译速度
            experimentalWatchApi: true,
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      src: path.resolve(__dirname, './src'),
    },
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  plugins: [
    // 单独配置 DefinePlugin 处理环境变量
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    }),
    // 需要进行忽略的插件
    new webpack.IgnorePlugin({
      checkResource(resource) {
        const lazyImports = [
            "@nestjs/microservices",
            "@nestjs/microservices/microservices-module",
            "@nestjs/websockets/socket-module",
            "@nestjs/websockets",
            "ioredis",
            "amqplib",
            "amqp-connection-manager",
            "mqtt",
            "nats",
            "kafkajs",
            "redis",
            "@grpc/grpc-js",
            "@grpc/proto-loader",
            "cache-manager",
            "class-validator",
            "class-transformer",
            "@nestjs/platform-socket.io",
            "socket.io",
            "ws",
            // "uid"
        ];
        if (!lazyImports.includes(resource)) {
          return false;
        }
        try {
          require.resolve(resource, {
            paths: [process.cwd()],
          });
        } catch (err) {
          console.log('忽略可选依赖:', resource);
          return true;
        }
        return false;
      },
    }),
    new ForkTsCheckerWebpackPlugin(),
    // 显式导入 reflect-metadata（确保 Webpack 识别其依赖）
    new webpack.ProvidePlugin({
      Reflect: 'reflect-metadata',
    }),

  ],
  // 保持 Node.js 原生模块的正常工作
  node: {
    __dirname: false,
    __filename: false,
  },
};