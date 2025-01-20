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
const mainContract = 'tNULSeBaN2W2u3S3thVwxaPofYwigvQLjhb2i7';

let pid = 0;
let tokenIds = [];
for (let i=0;i<10;i++) {
    tokenIds.push((i + 50) + "");
}

// sellToken(int pid, String[] tokenIds)
call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: mainContract,
    value: '0',
    methodName: "sellToken",
    methodDesc: "",
    args: [
        pid, tokenIds
    ]
}, 'call contract...', []);

