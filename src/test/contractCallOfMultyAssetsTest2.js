
const call = require('./contractCall.js');

/**
 * 调用合约同时转入NULS和USDT, 举例数据: NULS 其他资产 5-14(USDT)
 * 转入6.6NULS和2USDT
 */
// 用户私钥
let pri = '9ce21dad67e0f0af2599b41b515a7f7018059418bab892a7b68f283d489abc4b';
// 用户公钥
let pub = '03958b790c331954ed367d37bac901de5c2f06ac8368b37d7bd6cd5ae143c1d7e3';
// 用户地址
let fromAddress = "tNULSeBaMvEtDfvZuukDf2mVyfGo3DdiN8KLRG";
// 业务合约地址
let busContractAddress = "tNULSeBaN5ZoJhP84ePhDsSENXMs5NzK24JjLX";
// 要转入的NULS数量，如果没有请填入0，如转入200个NULS，则填入20000000000，此处填入的值要乘以10的8次幂，如200个NULS，则`value = 200 * (10 ^ 8)`
let nulsAmount = 660000000;
// 资产链ID
let assetChainId = 2;
// 资产ID
let assetId = 1;
// 交易备注
let remark = 'call contract...';

let contractCall = {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: busContractAddress,
    value: nulsAmount, //
    methodName: "receiveAllAssets",
    methodDesc: "",
    args: []
};
// 转入2个USDT
let multyAssets = [
    {
        value: "2000000",
        assetChainId: 5,
        assetId: 14
    }
];
//调用合约
call.callContract(pri, pub, fromAddress, assetChainId, assetId, contractCall, remark, multyAssets);
