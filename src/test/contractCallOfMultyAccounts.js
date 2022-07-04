
/**
 * 调用合约的同时, 支持向其他账户转账，示例为token跨链转账
 */

const call = require('./contractCall.js');
const BigNumber = require('bignumber.js');
const TEN = new BigNumber('10');
// 手续费支出地址
let payAccount = 'tNULSeBaMvEtDfvZuukDf2mVyfGo3DdiN8KLRG';
// 用户私钥
let pri = '8c6715620151478cdd4ee8c95b688f2c2112a21a266f060973fa776be3f0ebd7';
// 用户公钥
let pub = '02d0b400dfd6dd9ecdf81a068e8311c3cd4f873162389901d793d41e2043128635';
// 用户地址
let fromAddress = "tNULSeBaMuU6sq72mptyghDXDWQXKJ5QUaWhGj";
// 链主资产链ID
let assetChainId = 2;
// 链主资产ID
let assetId = 1;
// 转入地址
let toAddress = "tNULSeBaMnrs6JKrCy6TQdzYJZkMZJDng7QAsD";
// NRC20合约地址
let nrc20ContractAddress = "tNULSeBaMzRzrsGToWnL4BeCMnHyMNBayDNrH3";
// 转移的token数量
let tokenNumber = new BigNumber('2');
// token decimals
let decimals = 18;
// 要转入的NULS数量，如果没有请填入0，如转入200个NULS，则填入20000000000，此处填入的值要乘以10的8次幂，如200个NULS，则`value = 200 * (10 ^ 8)`
let nulsAmount = 0;
// 交易备注
let remark = 'nrc20 token cross transfer...';

let contractCall = {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: nrc20ContractAddress,
    value: nulsAmount, //
    methodName: "transfer",
    methodDesc: "",
    args: [toAddress, tokenNumber.shiftedBy(decimals)]
};
//调用合约
call.callContract(pri, pub, fromAddress, assetChainId, assetId, contractCall, remark, null, null, payAccount);
