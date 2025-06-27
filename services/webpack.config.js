const path = require('path');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
module.exports = {
  entry: path.resolve(__dirname, './src/main.ts'), // 你的主入口文件
  target: 'node',
  mode: 'production',
  // 置为空即可忽略webpack-node-externals插件
  externals: {},
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
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
            "ws"
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
  ],
  externals: [/(node-fetch)/], // 如果有需要外部化的依赖项
};
