const call = require('../contractCall.js');
const BigNumber = require("bignumber.js");
const nuls = require("../../index");

// 用户私钥
const pri = '9ce21dad67e0f0af2599b41b515a7f7018059418bab892a7b68f283d489abc4b';
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
const mainContract = 'tNULSeBaNA3MVKDseGH9w4LbDDJdotFEh4gNoP';

// 发布token
// String uri, String extendUri, String name, String symbol, String payAsset, BigInteger price, int maxTotalSupply,
// boolean tigerMode, int mintEndingProgress, int swapFeeRate
call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: mainContract,
    value: new BigNumber(10).shiftedBy(8).toFixed(), //
    methodName: "createToken",
    methodDesc: "",
    args: [
        'uritest', 'extendUriTest', 'token1n', 'token1s', '2-1', new BigNumber(600).shiftedBy(8).toFixed(), 100, true, 6000, 30
    ]
}, 'call contract...', []);
