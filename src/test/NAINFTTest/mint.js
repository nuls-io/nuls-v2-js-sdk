const call = require('../contractCall.js');
const BigNumber = require("bignumber.js");
const nuls = require("../../index");

// 用户私钥
const pri = '';
const importAddress = nuls.importByKey(2, pri, '', "tNULS");
// 用户公钥
const pub = importAddress.pub;
// 用户地址
const fromAddress = importAddress.address;
// 资产链ID
const assetChainId = 2;
// 资产ID
const assetId = 1;
const mainContract = 'tNULSeBaMzkhJFy6ZnR5E4mebQa36hAR9mQEeB';

let pid = 0;
let mintAmount = 20;
// mint token
// int pid, int mintAmount
call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: mainContract,
    value: new BigNumber(2*mintAmount).shiftedBy(8).toFixed(), //
    methodName: "mint",
    methodDesc: "",
    args: [
        pid, mintAmount
    ]
}, 'call contract...', []);
