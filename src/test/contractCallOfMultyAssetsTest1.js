
const call = require('./contractCall.js');

/**
 * 调用合约转入多资产, 举例资产数据 5-1(NVT)
 */
// 用户私钥
let pri = '477059f40708313626cccd26f276646e4466032cabceccbf571a7c46f954eb75';
// 用户公钥
let pub = '0318f683066b45e7a5225779061512e270044cc40a45c924afcf78bb7587758ca0';
// 用户地址
let fromAddress = "tNULSeBaMnrs6JKrCy6TQdzYJZkMZJDng7QAsD";
// 业务合约地址
let busContractAddress = "tNULSeBaN7pquou8YXJZmPbkna37j7rJRUe5fV";
// 要转入的NULS数量，如果没有请填入0，如转入200个NULS，则填入20000000000，此处填入的值要乘以10的8次幂，如200个NULS，则`value = 200 * (10 ^ 8)`
let nulsAmount = 0;
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
    methodName: "_payableMultyAsset",
    methodDesc: "",
    args: []
};
// 转入0.2个NVT
let multyAssets = [
    {
        value: "200000000000000000",
        assetChainId: 5,
        assetId: 74
    }
];
//调用合约
call.callContract(pri, pub, fromAddress, assetChainId, assetId, contractCall, remark, multyAssets);
