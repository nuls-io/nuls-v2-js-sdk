const call = require('../../contractCall.js');
const BigNumber = require("bignumber.js");
const nuls = require("../../../index");
require('dotenv').config({ path: '../../../test/.env'});

// 用户私钥
const pri = process.env.xaf;
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

// Integer chainId, Integer assetId, Address token, BigInteger liquidity, BigInteger amountTokenMin, BigInteger amountETHMin, Address to, BigInteger deadline
call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: mainContract,
    value: 0, //
    methodName: "removeLiquidityWAsset",
    methodDesc: "",
    args: [
        5, 74, process.env.qqq, new BigNumber('3348469228349534293591').shiftedBy(0).toFixed(), 0, 0, fromAddress, nuls.currentTime() + 300
    ]
}, 'remove lp usdt and qqq', []);


