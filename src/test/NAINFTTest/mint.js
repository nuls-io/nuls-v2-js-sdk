const call = require('../contractCall.js');
const BigNumber = require("bignumber.js");
const nuls = require("../../index");
require('dotenv').config({ path: '../../test/.env'});

// 用户私钥
const pri = process.env.l24;
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
const mainContract = 'tNULSeBaN8wP2oywBZXZDZVYKxfz9UcfMYSA6Y';

let pid = 0;
let mintAmount = 20;
let mintPrice = 600;// mint一个nft需要的nuls数量
// mint token
// int pid, int mintAmount
call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: mainContract,
    value: new BigNumber(mintPrice*mintAmount).shiftedBy(8).toFixed(), //
    methodName: "mint",
    methodDesc: "",
    args: [
        pid, mintAmount
    ]
}, 'call contract...', []);
