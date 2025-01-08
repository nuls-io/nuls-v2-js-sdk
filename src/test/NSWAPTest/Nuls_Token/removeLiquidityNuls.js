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
const mainContract = 'tNULSeBaN45qZwijawwFc3UtPX8mZAUJk3bbfJ';

call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: mainContract,
    value: 0, //
    methodName: "removeLiquidityNuls",
    methodDesc: "",
    args: [
        'tNULSeBaMy1Rk3KaHcvXYTGNoNpr8ckAzkKWfS', new BigNumber('353553390592773').shiftedBy(0).toFixed(), 0, 0, fromAddress, nuls.currentTime() + 300
    ]
}, 'remove lp nuls and fark', []);


