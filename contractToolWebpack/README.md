# NULS 合约工具 - Webpack 打包版本

这是一个纯前端版本的 NULS 智能合约测试工具，使用 webpack 打包，无需 Node.js 后端服务器即可运行。

## 功能特性

- ✅ 普通转账
- ✅ NRC20 Token 转账
- ✅ 创建智能合约
- ✅ 调用智能合约
- ✅ 查询视图方法
- ✅ 支持主网、测试网、本地网和自定义网络

## 安装依赖

```bash
cd contractToolWebpack
npm install
```

## 构建项目

```bash
npm run build
```

构建完成后，所有文件将输出到 `dist` 目录。

## 使用方法

1. 构建项目：`npm run build`
2. 打开 `dist/contract-tool.html` 文件（可以直接在浏览器中打开，或使用本地服务器）

## 开发模式

```bash
npm run dev
```

这将启动 webpack 的 watch 模式，文件修改后会自动重新构建。

## 文件结构

```
contractToolWebpack/
├── src/
│   ├── index.js          # 入口文件，导出 API 模块
│   ├── api.js            # 前端 API 模块（将后端逻辑移到前端）
│   └── contract-tool.html # HTML 页面
├── dist/                 # 构建输出目录（构建后生成）
│   ├── bundle.js         # 打包后的 JavaScript 文件
│   └── contract-tool.html # 最终的 HTML 文件
├── webpack.config.js     # Webpack 配置
├── package.json          # 项目配置
└── README.md            # 本文件
```

## 技术说明

- 使用 webpack 5 进行打包
- 使用 babel 进行代码转换
- 所有后端逻辑已移到前端，直接调用 NULS SDK 和 RPC 接口
- 支持浏览器环境运行，无需 Node.js 服务器

## 注意事项

1. 首次使用前需要先运行 `npm install` 安装依赖
2. 构建后的文件在 `dist` 目录中
3. 由于直接在浏览器中运行，某些 Node.js 特定的功能可能不可用
4. 如果遇到 CORS 问题，建议使用本地服务器（如 `python -m http.server` 或 `npx serve`）来访问 HTML 文件

