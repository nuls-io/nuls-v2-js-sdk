const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        clean: true
    },
    resolve: {
        fallback: {
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            "buffer": require.resolve("buffer"),
            "util": require.resolve("util"),
            "path": require.resolve("path-browserify"),
            "vm": require.resolve("vm-browserify"),
            "process": require.resolve("process/browser"),
            "fs": false,
            "net": false,
            "tls": false
        },
        alias: {
            // 确保使用正确的路径
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/contract-tool.html',
            filename: 'contract-tool.html',
            inject: 'body',  // 注入到 body 末尾
            scriptLoading: 'blocking'  // 阻塞式加载，确保顺序执行
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                targets: {
                                    browsers: ['> 1%', 'last 2 versions']
                                },
                                modules: false
                            }]
                        ]
                    }
                }
            }
        ]
    },
    optimization: {
        minimize: true
    },
    performance: {
        hints: 'warning',
        maxEntrypointSize: 2000000, // 2MB
        maxAssetSize: 2000000 // 2MB
    }
};

