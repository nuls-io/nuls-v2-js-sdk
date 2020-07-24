
const call = require('./contractCall.js');
const BigNumber = require('bignumber.js');
const TEN = new BigNumber('10');
/**
 * @disc: NRC20 token transfer dome
 * @date: 2019-10-18 10:28
 * @author: Wave
 */
// 用户私钥
let pri = 'ddddb7cb859a467fbe05d5034735de9e62ad06db6557b64d7c139b6db856b200';
// 用户公钥
let pub = '02cb7d76b7e91d60fa3c10298b414e5fe711aed8011b583e366b918d27fc262d73';
// 用户地址
let fromAddress = "tNULSeBaMshNPEnuqiDhMdSA4iNs6LMgjY6tcL";
// 链主资产链ID
let assetChainId = 2;
// 链主资产ID
let assetId = 1;
// 转入地址
let toAddress = "tNULSeBaMnrs6JKrCy6TQdzYJZkMZJDng7QAsD";
// NRC20合约地址
let nrc20ContractAddress = "tNULSeBaN2vEicPEn15febEuvqM29X4wRZ5eGG";
// 转移的token数量
let tokenNumber = new BigNumber('100');
// token decimals
let decimals = 2;
// 交易备注
let remark = 'nrc20 token transfer...';

let contractCall = {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: nrc20ContractAddress,
    value: 0, //
    methodName: "transfer",
    methodDesc: "",
    args: [toAddress, tokenNumber.multipliedBy(TEN.pow(decimals))]
};
//调用合约
call.callContract(pri, pub, fromAddress, assetChainId, assetId, contractCall, remark);
