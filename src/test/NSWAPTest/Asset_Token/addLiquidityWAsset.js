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
const mainContract = 'tNULSeBaMyH35cm1jtDjdtqrQF9XYU7qt2kwMN';

// 转入200个USDT
let multyAssets = [
    {
        value: new BigNumber("100").shiftedBy(18).toFixed(),
        assetChainId: 5,
        assetId: 74
    }
];

//Integer chainId, Integer assetId, Address token, BigInteger amountTokenDesired, BigInteger amountTokenMin, BigInteger amountETHMin, Address to, BigInteger deadline
call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: mainContract,
    value: 0, //
    methodName: "addLiquidityWAsset",
    methodDesc: "",
    args: [
        5, 74, "tNULSeBaNBvNyhUxFQXiBJk6pSqCr2qTFFvVdt", new BigNumber("500").shiftedBy(18).toFixed(), 0, 0, fromAddress, nuls.currentTime() + 300
    ]
}, 'add lp usdt and qqq', multyAssets);
