/**
 * NULS智能合约测试工具 - 后端服务器
 * 
 * 使用说明:
 * 1. 安装依赖: npm install express cors body-parser
 * 2. 启动服务: node contract-tool-server.js
 * 3. 在浏览器打开 contract-tool.html
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const nuls = require('./src/index');
const contractCreate = require('./src/test/contractCreate');
const contractCall = require('./src/test/contractCall');
const contractMulticall = require('./src/test/contractMulticall');
const BigNumber = require('bignumber.js');
const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务
app.use(express.static(__dirname));

// 日志中间件
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

/**
 * 配置网络环境
 * POST /api/config-network
 * Body: { network: 'main'|'test'|'dev', customUrl: string, chainId: number }
 */
app.post('/api/config-network', (req, res) => {
    try {
        const { network, customUrl, chainId } = req.body;
        
        if (network === 'main') {
            nuls.mainnet();
        } else if (network === 'test') {
            nuls.testnet();
        } else if (network === 'dev') {
            nuls.customnet(chainId || 101, customUrl || 'http://127.0.0.1:18004/jsonrpc');
        } else if (network === 'custom' && customUrl) {
            nuls.customnet(chainId, customUrl);
        }
        
        res.json({
            success: true,
            message: '网络配置成功',
            chainId: nuls.chainId()
        });
    } catch (error) {
        console.error('配置网络失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 创建智能合约
 * POST /api/create-contract
 * Body: {
 *   privateKey: string,
 *   alias: string,
 *   contractCode: string,
 *   args: array,
 *   remark: string,
 *   chainId: number,
 *   assetId: number,
 *   addressPrefix: string
 * }
 */
app.post('/api/create-contract', async (req, res) => {
    try {
        const {
            privateKey,
            alias,
            contractCode,
            args,
            remark,
            chainId,
            assetId,
            addressPrefix
        } = req.body;
        
        // 验证必填参数
        if (!privateKey || !contractCode) {
            return res.status(400).json({
                success: false,
                error: '私钥和合约代码为必填项'
            });
        }
        
        // 配置网络（如果提供了chainId）
        if (chainId) {
            // 网络应该已经在前端配置好了，这里只是确保一致性
            console.log('使用链ID:', chainId);
        }
        
        // 导入地址
        const importAddress = nuls.importByKey(chainId, privateKey, '', addressPrefix);
        const pub = importAddress.pub;
        const fromAddress = importAddress.address;
        
        console.log('创建合约 - 发送地址:', fromAddress);
        console.log('创建合约 - 参数数量:', args ? args.length : 0);
        
        // 构建合约创建对象
        const contractCreateData = {
            chainId: chainId,
            sender: fromAddress,
            alias: alias || '',
            contractCode: contractCode,
            args: args || []
        };
        
        console.log('开始创建合约...');
        
        // 调用SDK创建合约
        const result = await contractCreate.createContract(
            privateKey,
            pub,
            fromAddress,
            chainId,
            assetId,
            contractCreateData,
            remark || '',
            addressPrefix
        );
        
        console.log('创建合约返回结果:', result);
        
        // 检查返回结果
        if (!result || !result.success) {
            throw new Error(result && result.data ? result.data : '创建合约失败');
        }
        
        // 返回成功结果
        res.json({
            success: true,
            message: '合约创建成功',
            data: {
                fromAddress: fromAddress,
                contractAddress: result.data.contractAddress,
                txHash: result.data.hash,
                value: result.data.value
            }
        });
        
    } catch (error) {
        console.error('创建合约失败:', error);
        
        // 提取更友好的错误信息
        let errorMessage = error.message || error.toString();
        
        // 检查是否是特定的错误类型
        if (errorMessage.includes('获取合约构造函数失败')) {
            errorMessage = '合约代码无效或格式错误。请检查:\n1. 合约代码是否完整\n2. 合约代码是否为有效的十六进制字符串\n3. 是否能正确解析合约结构\n\n详细错误: ' + errorMessage;
        } else if (errorMessage.includes('balance') || errorMessage.includes('余额')) {
            errorMessage = '账户余额不足。请确保账户有足够的余额支付手续费和gas费。\n\n详细错误: ' + errorMessage;
        } else if (errorMessage.includes('nonce')) {
            errorMessage = 'Nonce错误，可能是网络连接问题。请检查网络配置。\n\n详细错误: ' + errorMessage;
        }
        
        res.status(500).json({
            success: false,
            error: errorMessage,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * 调用智能合约
 * POST /api/call-contract
 * Body: {
 *   privateKey: string,
 *   contractAddress: string,
 *   methodName: string,
 *   methodDesc: string,
 *   value: number,
 *   args: array,
 *   remark: string,
 *   chainId: number,
 *   assetId: number,
 *   addressPrefix: string
 * }
 */
app.post('/api/call-contract', async (req, res) => {
    try {
        const {
            privateKey,
            contractAddress,
            methodName,
            methodDesc,
            value,
            args,
            remark,
            chainId,
            assetId,
            addressPrefix
        } = req.body;
        
        // 验证必填参数
        if (!privateKey || !contractAddress || !methodName) {
            return res.status(400).json({
                success: false,
                error: '私钥、合约地址和方法名为必填项'
            });
        }
        
        // 导入地址
        const importAddress = nuls.importByKey(chainId, privateKey, '', addressPrefix);
        const pub = importAddress.pub;
        const fromAddress = importAddress.address;
        
        console.log('调用合约 - 发送地址:', fromAddress);
        console.log('调用合约 - 合约地址:', contractAddress);
        console.log('调用合约 - 方法名:', methodName);
        console.log('调用合约 - 参数数量:', args ? args.length : 0);
        
        // 构建合约调用对象
        const contractCallData = {
            chainId: chainId,
            sender: fromAddress,
            contractAddress: contractAddress,
            value: value || 0,
            methodName: methodName,
            methodDesc: methodDesc || '',
            args: args || []
        };
        
        console.log('开始调用合约...');
        
        // 调用SDK调用合约
        const result = await contractCall.callContract(
            privateKey,
            pub,
            fromAddress,
            chainId,
            assetId,
            contractCallData,
            remark || ''
        );
        
        console.log('调用合约返回结果:', result);
        
        // 检查返回结果
        if (!result || !result.success) {
            throw new Error(result && result.data ? result.data : '调用合约失败');
        }
        
        // 返回成功结果
        res.json({
            success: true,
            message: '合约调用成功',
            data: {
                fromAddress: fromAddress,
                contractAddress: contractAddress,
                methodName: methodName,
                txHash: result.data.hash,
                value: result.data.value
            }
        });
        
    } catch (error) {
        console.error('调用合约失败:', error);
        
        // 提取更友好的错误信息
        let errorMessage = error.message || error.toString();
        
        // 检查是否是特定的错误类型
        if (errorMessage.includes('balance') || errorMessage.includes('余额')) {
            errorMessage = '账户余额不足。请确保账户有足够的余额支付手续费和gas费。\n\n详细错误: ' + errorMessage;
        } else if (errorMessage.includes('contract') && errorMessage.includes('not found')) {
            errorMessage = '合约不存在或地址无效。请检查合约地址是否正确。\n\n详细错误: ' + errorMessage;
        } else if (errorMessage.includes('method') || errorMessage.includes('方法')) {
            errorMessage = '合约方法调用失败。请检查:\n1. 方法名是否正确\n2. 参数类型和数量是否匹配\n3. 合约是否支持该方法\n\n详细错误: ' + errorMessage;
        } else if (errorMessage.includes('imputedCallGas')) {
            errorMessage = 'Gas预估失败。可能的原因:\n1. 合约地址无效\n2. 方法不存在\n3. 参数错误\n4. 网络连接问题\n\n详细错误: ' + errorMessage;
        }
        
        res.status(500).json({
            success: false,
            error: errorMessage,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * 普通转账
 * POST /api/transfer
 * Body: {
 *   privateKey: string,
 *   toAddress: string,
 *   amount: number,
 *   remark: string,
 *   chainId: number,
 *   assetId: number,
 *   addressPrefix: string
 * }
 */
app.post('/api/transfer', async (req, res) => {
    try {
        const {
            privateKey,
            toAddress,
            amount,
            remark,
            chainId,
            assetId,
            addressPrefix
        } = req.body;
        
        // 验证必填参数
        if (!privateKey || !toAddress || !amount) {
            return res.status(400).json({
                success: false,
                error: '私钥、目标地址和金额为必填项'
            });
        }
        
        // 导入地址
        const importAddress = nuls.importByKey(chainId, privateKey, '', addressPrefix);
        const pub = importAddress.pub;
        const fromAddress = importAddress.address;
        
        console.log('普通转账 - 发送地址:', fromAddress);
        console.log('普通转账 - 目标地址:', toAddress);
        console.log('普通转账 - 金额:', amount);
        
        // 获取余额
        const {getBalance, countFee, inputsOrOutputs, validateTx, broadcastTx} = require('./src/test/api/util');
        const balanceInfo = await getBalance(chainId, chainId, assetId, fromAddress);
        
        if (!balanceInfo || balanceInfo.balance === undefined) {
            throw new Error('获取账户余额失败');
        }
        
        console.log('账户余额:', new BigNumber(balanceInfo.balance).shiftedBy(0 - nuls.decimals()).toFixed());
        
        // 转换金额（前端传入的是实际金额，需要乘以10^nuls.decimals()）
        const transferAmount = new BigNumber(amount).shiftedBy(nuls.decimals());
        
        let transferInfo = {
            fromAddress: fromAddress,
            toAddress: toAddress,
            assetsChainId: chainId,
            assetsId: assetId,
            amount: transferAmount,
            fee: new BigNumber("0.001").shiftedBy(nuls.decimals())
        };
        
        let newAmount = transferInfo.amount.plus(transferInfo.fee);
        if (new BigNumber(balanceInfo.balance).isLessThan(newAmount)) {
            throw new Error('余额不足，当前余额: ' + 
                (new BigNumber(balanceInfo.balance).shiftedBy(0 - nuls.decimals()).toFixed()) 
                + '，需要: ' + 
                (newAmount.shiftedBy(0 - nuls.decimals()).toFixed())
            );
        }
        
        // 组装inputs和outputs
        let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 2);
        if (!inOrOutputs.success) {
            throw new Error('组装交易失败: ' + inOrOutputs.data);
        }
        
        // 组装交易
        let tAssemble = await nuls.transactionAssemble(
            inOrOutputs.data.inputs,
            inOrOutputs.data.outputs,
            remark || '',
            2
        );
        
        // 计算手续费
        let newFee = countFee(tAssemble, 1);
        
        // 如果手续费变化，重新组装交易
        if (transferInfo.fee.isLessThan(newFee)) {
            transferInfo.fee = newFee;
            inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 2);
            tAssemble = await nuls.transactionAssemble(
                inOrOutputs.data.inputs,
                inOrOutputs.data.outputs,
                remark || '',
                2
            );
        }
        
        // 签名交易
        let txhex = await nuls.transactionSerialize(privateKey, pub, tAssemble);
        
        console.log('交易hex:', txhex);
        console.log('交易hex:', txhex.substring(0, 100) + '...');
        
        // 验证交易
        let validateResult = await validateTx(txhex);
        if (!validateResult.success) {
            throw new Error('验证交易失败: ' + JSON.stringify(validateResult.error));
        }
        
        // 广播交易
        let broadcastResult = await broadcastTx(txhex);
        console.log('广播结果:', broadcastResult);
        
        if (broadcastResult && broadcastResult.value) {
            res.json({
                success: true,
                message: '转账成功',
                data: {
                    fromAddress: fromAddress,
                    toAddress: toAddress,
                    amount: amount,
                    txHash: broadcastResult.hash || broadcastResult.value,
                    fee: new BigNumber(newFee).shiftedBy(0 - nuls.decimals()).toFixed()
                }
            });
        } else {
            throw new Error('广播交易失败: ' + JSON.stringify(broadcastResult));
        }
        
    } catch (error) {
        console.error('转账失败:', error);
        
        // 提取更友好的错误信息
        let errorMessage = error.message || error.toString();
        
        if (errorMessage.includes('balance') || errorMessage.includes('余额')) {
            errorMessage = '账户余额不足。\n\n详细错误: ' + errorMessage;
        } else if (errorMessage.includes('address') || errorMessage.includes('地址')) {
            errorMessage = '地址格式错误。请检查地址是否正确。\n\n详细错误: ' + errorMessage;
        }
        
        res.status(500).json({
            success: false,
            error: errorMessage,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * 批量查询NRC20 Token信息
 * POST /api/token-info
 * Body: {
 *   contractAddress: string,
 *   holderAddress?: string
 * }
 */
app.post('/api/token-info', async (req, res) => {
    try {
        const { contractAddress, holderAddress } = req.body;
        if (!contractAddress || !contractAddress.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Token合约地址不能为空'
            });
        }

        const normalizedContract = contractAddress.trim();
        const contractAddressArray = [normalizedContract, normalizedContract, normalizedContract];
        const methodNameArray = ['name', 'symbol', 'decimals'];
        const argsArray = ['', '', ''];

        const normalizedHolder = holderAddress && holderAddress.trim() ? holderAddress.trim() : null;
        if (normalizedHolder) {
            contractAddressArray.push(normalizedContract);
            methodNameArray.push('balanceOf');
            argsArray.push(normalizedHolder);
        }

        const result = await contractMulticall.multicall(contractAddressArray, methodNameArray, argsArray);
        if (!result || typeof result.result !== 'string') {
            throw new Error('批量查询返回结果异常');
        }

        let parsed;
        try {
            parsed = JSON.parse(result.result);
        } catch (error) {
            throw new Error('无法解析批量查询结果');
        }

        const responseData = {
            contractAddress: normalizedContract,
            name: parsed[0] || '',
            symbol: parsed[1] || '',
            decimals: Number(parsed[2]) || 0
        };

        if (normalizedHolder) {
            const balanceRaw = parsed[3] || '0';
            responseData.balanceRaw = balanceRaw;
            responseData.holderAddress = normalizedHolder;
            try {
                responseData.balanceFormatted = new BigNumber(balanceRaw || 0)
                    .shiftedBy(0 - (responseData.decimals || 0))
                    .toFixed();
            } catch (error) {
                responseData.balanceFormatted = balanceRaw;
            }
        }

        res.json({
            success: true,
            data: responseData
        });
    } catch (error) {
        console.error('查询Token信息失败:', error);
        res.status(500).json({
            success: false,
            error: error.message || '查询Token信息失败'
        });
    }
});

/**
 * 获取合约ABI信息
 * POST /api/get-contract-abi
 * Body: { contractAddress: string }
 */
app.post('/api/get-contract-abi', async (req, res) => {
    try {
        const { contractAddress } = req.body;
        
        if (!contractAddress || !contractAddress.trim()) {
            return res.status(400).json({
                success: false,
                error: '合约地址不能为空'
            });
        }
        
        const chainId = nuls.chainId();
        if (!chainId) {
            return res.status(400).json({
                success: false,
                error: '请先配置网络'
            });
        }
        
        // 调用 getContract RPC
        const axios = require('axios').default;
        const rpcUrl = axios.defaults.baseURL || 'http://127.0.0.1:18004/jsonrpc';
        const http = require('./src/test/api/https');
        const response = await http.postComplete(rpcUrl, 'getContract', [chainId, contractAddress.trim()]);
        
        if (response.error) {
            throw new Error(response.error.message || '获取合约信息失败');
        }
        
        if (!response.result || !response.result.method) {
            throw new Error('合约信息格式错误');
        }
        
        // 提取可调用函数（view=false, event=false, name!="<init>"）
        const callableMethods = response.result.method.filter(method => 
            method.view === false && 
            method.event === false && 
            method.name !== '<init>'
        );
        
        res.json({
            success: true,
            data: {
                contractAddress: contractAddress.trim(),
                contractInfo: response.result,
                callableMethods: callableMethods
            }
        });
        
    } catch (error) {
        console.error('获取合约ABI失败:', error);
        res.status(500).json({
            success: false,
            error: error.message || '获取合约ABI失败'
        });
    }
});

/**
 * 获取网络配置信息
 * GET /api/network-config
 */
app.get('/api/network-config', (req, res) => {
    res.json({
        success: true,
        data: {
            chainId: nuls.chainId(),
            decimals: nuls.decimals()
        }
    });
});

/**
 * 健康检查
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'NULS智能合约测试工具服务运行中',
        timestamp: new Date().toISOString(),
        chainId: nuls.chainId(),
        decimals: nuls.decimals()
    });
});

/**
 * 获取地址信息
 * POST /api/get-address
 * Body: { privateKey: string, chainId: number, addressPrefix: string }
 */
app.post('/api/get-address', (req, res) => {
    try {
        const { privateKey, chainId, addressPrefix } = req.body;
        
        if (!privateKey) {
            return res.status(400).json({
                success: false,
                error: '私钥为必填项'
            });
        }
        
        const importAddress = nuls.importByKey(chainId, privateKey, '', addressPrefix);
        
        res.json({
            success: true,
            data: {
                address: importAddress.address,
                publicKey: importAddress.pub
            }
        });
    } catch (error) {
        console.error('获取地址失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        success: false,
        error: err.message || '服务器内部错误'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('NULS智能合约测试工具服务已启动');
    console.log('='.repeat(60));
    console.log(`服务地址: http://localhost:${PORT}`);
    console.log(`前端页面: http://localhost:${PORT}/contract-tool.html`);
    console.log(`健康检查: http://localhost:${PORT}/api/health`);
    console.log('='.repeat(60));
    console.log('API端点:');
    console.log('  POST /api/config-network    - 配置网络环境');
    console.log('  POST /api/transfer          - 普通转账');
    console.log('  POST /api/create-contract   - 创建智能合约');
    console.log('  POST /api/call-contract     - 调用智能合约');
    console.log('  POST /api/get-address       - 获取地址信息');
    console.log('  GET  /api/health            - 健康检查');
    console.log('='.repeat(60));
    console.log('\n按 Ctrl+C 停止服务\n');
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n正在关闭服务器...');
    process.exit(0);
});

