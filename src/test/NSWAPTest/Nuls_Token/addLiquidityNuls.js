const call = require('../../contractCall.js');
const BigNumber = require("bignumber.js");
const nuls = require("../../../index");
require('dotenv').config({ path: '../../../test/.env'});

// 用户私钥
const pri = process.env.asd;
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
const mainContract = process.env.router;

call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: mainContract,
    value: new BigNumber(50).shiftedBy(8).toFixed(), //
    methodName: "addLiquidityNuls",
    methodDesc: "",
    args: [
        process.env.fark, new BigNumber(100).shiftedBy(18).toFixed(), 0, 0, fromAddress, nuls.currentTime() + 300
    ]
}, 'add lp nuls(50) and fark(100)', []);
