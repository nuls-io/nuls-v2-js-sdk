const call = require('../../contractCall.js');
const BigNumber = require("bignumber.js");
const nuls = require("../../../index");
require('dotenv').config({ path: '../../../test/.env'});

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
const mainContract = process.env.router;

// Integer chainId, Integer assetId, Integer chainId2, Integer assetId2, BigInteger liquidity, BigInteger amountTokenMin, BigInteger amountETHMin, Address to, BigInteger deadline
call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: mainContract,
    value: 0, //
    methodName: "removeLiquidityWAssetWAsset",
    methodDesc: "",
    args: [
        5, 74, 5, 1, new BigNumber('12247448713915000').shiftedBy(0).toFixed(), 0, 0, fromAddress, nuls.currentTime() + 300
    ]
}, 'remove lp usdt and nvt', []);


