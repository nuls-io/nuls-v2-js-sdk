/**
 * 前端 API 模块 - 将后端逻辑移到前端
 * 直接使用 NULS SDK 和 RPC 调用
 */

// 这些模块将在 webpack 打包时被包含
// 使用相对路径从项目根目录导入
const nuls = require('../../src/index');
const contractCreate = require('../../src/test/contractCreate');
const contractCall = require('../../src/test/contractCall');
const contractMulticall = require('../../src/test/contractMulticall');
const BigNumber = require('bignumber.js');
const { getBalance, countFee, inputsOrOutputs, validateTx, broadcastTx } = require('../../src/test/api/util');
const http = require('../../src/test/api/https');

// 当前 RPC URL
let currentRpcUrl = 'http://127.0.0.1:18004/jsonrpc';

/**
 * 配置网络环境
 */
export function configNetwork(network, customUrl, chainId) {
    try {
        if (network === 'main') {
            nuls.mainnet();
            currentRpcUrl = 'https://api.nuls.io/jsonrpc';
        } else if (network === 'test') {
            nuls.testnet();
            currentRpcUrl = 'https://beta.api.nuls.io/jsonrpc';
        } else if (network === 'dev') {
            nuls.customnet(chainId || 101, customUrl || 'http://127.0.0.1:18004/jsonrpc');
            currentRpcUrl = customUrl || 'http://127.0.0.1:18004/jsonrpc';
        } else if (network === 'custom' && customUrl) {
            nuls.customnet(chainId, customUrl);
            currentRpcUrl = customUrl;
        }
        
        return {
            success: true,
            message: '网络配置成功',
            chainId: nuls.chainId()
        };
    } catch (error) {
        console.error('配置网络失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 获取网络配置信息
 */
export function getNetworkConfig() {
    return {
        success: true,
        data: {
            chainId: nuls.chainId(),
            decimals: nuls.decimals()
        }
    };
}

/**
 * 获取地址信息
 */
export function getAddress(privateKey, chainId, addressPrefix) {
    try {
        if (!privateKey) {
            return {
                success: false,
                error: '私钥为必填项'
            };
        }
        
        const importAddress = nuls.importByKey(chainId, privateKey, '', addressPrefix);
        
        return {
            success: true,
            data: {
                address: importAddress.address,
                publicKey: importAddress.pub
            }
        };
    } catch (error) {
        console.error('获取地址失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 普通转账
 */
export async function transfer(params) {
    try {
        const {
            privateKey,
            toAddress,
            amount,
            remark,
            chainId,
            assetId,
            addressPrefix
        } = params;
        
        // 验证必填参数
        if (!privateKey || !toAddress || !amount) {
            return {
                success: false,
                error: '私钥、目标地址和金额为必填项'
            };
        }
        
        // 导入地址
        const importAddress = nuls.importByKey(chainId, privateKey, '', addressPrefix);
        const pub = importAddress.pub;
        const fromAddress = importAddress.address;
        
        console.log('普通转账 - 发送地址:', fromAddress);
        console.log('普通转账 - 目标地址:', toAddress);
        console.log('普通转账 - 金额:', amount);
        
        // 获取余额
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
            return {
                success: true,
                message: '转账成功',
                data: {
                    fromAddress: fromAddress,
                    toAddress: toAddress,
                    amount: amount,
                    txHash: broadcastResult.hash || broadcastResult.value,
                    fee: new BigNumber(newFee).shiftedBy(0 - nuls.decimals()).toFixed()
                }
            };
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
        
        return {
            success: false,
            error: errorMessage
        };
    }
}

/**
 * 创建智能合约
 */
export async function createContract(params) {
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
        } = params;
        
        // 验证必填参数
        if (!privateKey || !contractCode) {
            return {
                success: false,
                error: '私钥和合约代码为必填项'
            };
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
        return {
            success: true,
            message: '合约创建成功',
            data: {
                fromAddress: fromAddress,
                contractAddress: result.data.contractAddress,
                txHash: result.data.hash,
                value: result.data.value
            }
        };
        
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
        
        return {
            success: false,
            error: errorMessage
        };
    }
}

/**
 * 调用智能合约
 */
export async function callContract(params) {
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
        } = params;
        
        // 验证必填参数
        if (!privateKey || !contractAddress || !methodName) {
            return {
                success: false,
                error: '私钥、合约地址和方法名为必填项'
            };
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
        return {
            success: true,
            message: '合约调用成功',
            data: {
                fromAddress: fromAddress,
                contractAddress: contractAddress,
                methodName: methodName,
                txHash: result.data.hash,
                value: result.data.value
            }
        };
        
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
        
        return {
            success: false,
            error: errorMessage
        };
    }
}

/**
 * 批量查询NRC20 Token信息
 */
export async function getTokenInfo(params) {
    try {
        const { contractAddress, holderAddress } = params;
        if (!contractAddress || !contractAddress.trim()) {
            return {
                success: false,
                error: 'Token合约地址不能为空'
            };
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

        return {
            success: true,
            data: responseData
        };
    } catch (error) {
        console.error('查询Token信息失败:', error);
        return {
            success: false,
            error: error.message || '查询Token信息失败'
        };
    }
}

/**
 * 获取合约ABI信息
 */
export async function getContractAbi(params) {
    try {
        const { contractAddress } = params;
        
        if (!contractAddress || !contractAddress.trim()) {
            return {
                success: false,
                error: '合约地址不能为空'
            };
        }
        
        const chainId = nuls.chainId();
        if (!chainId) {
            return {
                success: false,
                error: '请先配置网络'
            };
        }
        
        // 调用 getContract RPC
        const response = await http.postComplete(currentRpcUrl, 'getContract', [chainId, contractAddress.trim()]);
        
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
        
        return {
            success: true,
            data: {
                contractAddress: contractAddress.trim(),
                contractInfo: response.result,
                callableMethods: callableMethods
            }
        };
        
    } catch (error) {
        console.error('获取合约ABI失败:', error);
        return {
            success: false,
            error: error.message || '获取合约ABI失败'
        };
    }
}

/**
 * 获取合约构造函数信息
 */
export async function getContractConstructor(params) {
    try {
        const contractCode = typeof params === 'string' ? params : params.contractCode;
        if (!contractCode) {
            return {
                success: false,
                error: '合约代码不能为空'
            };
        }
        
        const chainId = nuls.chainId();
        if (!chainId) {
            return {
                success: false,
                error: '请先配置网络'
            };
        }
        
        // 调用 getContractConstructor RPC
        const response = await http.postComplete(currentRpcUrl, 'getContractConstructor', [chainId, contractCode]);
        
        if (response.error) {
            throw new Error(response.error.message || '获取合约构造函数失败');
        }
        
        return {
            success: true,
            data: response.result
        };
        
    } catch (error) {
        console.error('获取合约构造函数失败:', error);
        return {
            success: false,
            error: error.message || '获取合约构造函数失败'
        };
    }
}

