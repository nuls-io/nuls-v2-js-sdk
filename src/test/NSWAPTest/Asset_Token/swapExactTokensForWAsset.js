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

// Integer chainId, Integer assetId, BigInteger amountIn, BigInteger amountOutMin, String[] path, Address to, BigInteger deadline, Address ref
call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: mainContract,
    value: 0, //
    methodName: "swapExactTokensForWAsset",
    methodDesc: "",
    args: [
        5, 74, new BigNumber("2").shiftedBy(18).toFixed(), 0, ['tNULSeBaNBvNyhUxFQXiBJk6pSqCr2qTFFvVdt', 'wusdt地址'], fromAddress, nuls.currentTime() + 300, 'tNULSeBaN5nddf9WkQgRr3RNwARgryndv2Bzs6'
    ]
}, 'swap qqq for usdt', []);
