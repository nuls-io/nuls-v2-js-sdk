
const call = require('./contractCall.js');

/**
 * @disc: 调用合约dome - token授权
 * @date: 2019-10-18 10:28
 * @author: Wave
 */
// 用户私钥
let pri = '';
// 用户公钥
let pub = '02cb7d76b7e91d60fa3c10298b414e5fe711aed8011b583e366b918d27fc262d73';
// 用户地址
let fromAddress = "tNULSeBaMshNPEnuqiDhMdSA4iNs6LMgjY6tcL";
// 业务合约地址
let busContractAddress = "tNULSeBaMyCzpjWfk4Y4EfGaQq9z72C12GLRpy";
// 要转入的NULS数量，如果没有请填入0，如转入200个NULS，则填入20000000000，此处填入的值要乘以10的8次幂，如200个NULS，则`value = 200 * (10 ^ 8)`
let nulsAmount = 10000;
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
    methodName: "_payable",
    methodDesc: "",
    args: []
};
//调用合约
call.callContract(pri, pub, fromAddress, assetChainId, assetId, contractCall, remark);
