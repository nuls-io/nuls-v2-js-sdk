const call = require('../contractCall.js');
const BigNumber = require("bignumber.js");
const nuls = require("../../index");
require('dotenv').config({ path: '../../test/.env'});

// 用户私钥
const pri = process.env.lrg;
const importAddress = nuls.importByKey(2, pri, '', "tNULS");
// 用户公钥
const pub = importAddress.pub;
// 用户地址
const fromAddress = importAddress.address;
console.log('fromAddress', fromAddress);
// 资产链ID
const assetChainId = 2;
// 资产ID
const assetId = 1;
const mainContract = 'tNULSeBaN3fGjoJLt5bMVBMjBT9bJHkJwHL2xu';

let pid = 0;
let tokenAmount = 20;
let payNULS = 24000;// 支付的NULS数量
// buyToken(int pid, int tokenAmount)
call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: mainContract,
    value: new BigNumber(payNULS).shiftedBy(8).toFixed(),
    methodName: "buyToken",
    methodDesc: "",
    args: [
        pid, tokenAmount
    ]
}, 'call contract...', []);

