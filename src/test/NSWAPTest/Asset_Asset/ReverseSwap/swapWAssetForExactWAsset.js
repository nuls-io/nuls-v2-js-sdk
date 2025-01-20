const call = require('../../../contractCall.js');
const BigNumber = require("bignumber.js");
const nuls = require("../../../../index");
require('dotenv').config({ path: '../../../../test/.env'});

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

let multyAssets = [
    {
        value: new BigNumber("2").shiftedBy(18).toFixed(),
        assetChainId: 5,
        assetId: 74
    }
];

// Integer chainId, Integer assetId, Integer chainId2, Integer assetId2, BigInteger amountOut, String[] path, Address to, BigInteger deadline, Address ref
call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: mainContract,
    value: 0, //
    methodName: "swapWAssetForExactWAsset",
    methodDesc: "",
    args: [
        5, 74, 5, 1, new BigNumber("50").shiftedBy(8).toFixed(), [process.env.wusdt, process.env.wnvt], fromAddress, nuls.currentTime() + 300, 'tNULSeBaN5nddf9WkQgRr3RNwARgryndv2Bzs6'
    ]
}, 'swap usdt for nvt', multyAssets);
