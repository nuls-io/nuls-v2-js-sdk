const call = require('../contractCall.js');
const nuls = require("../../index");

// 用户私钥
const pri = '9ce21dad67e0f0af2599b41b515a7f7018059418bab892a7b68f283d489abc4b';
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

// 发布token
// String uri, String name, String symbol, String payAsset, BigInteger price, int maxTotalSupply,
// boolean tigerMode, int mintEndingProgress, int swapFeeRate
call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: mainContract,
    value: 1000000000, //
    methodName: "createToken",
    methodDesc: "",
    args: [
        'uritest', 'token1n', 'token1s', '2-1', '200000000', 100, true, 6000, 2000
    ]
}, 'call contract...', []);
