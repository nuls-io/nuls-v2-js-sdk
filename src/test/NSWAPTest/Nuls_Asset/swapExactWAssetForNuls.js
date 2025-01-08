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

// 转入1个NVT
let multyAssets = [
    {
        value: new BigNumber("1").shiftedBy(8).toFixed(),
        assetChainId: 5,
        assetId: 1
    }
];

// Integer chainId, Integer assetId, BigInteger amountIn, BigInteger amountOutMin, String[] path, Address to, BigInteger deadline, Address ref
call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: mainContract,
    value: 0, //
    methodName: "swapExactWAssetForNuls",
    methodDesc: "",
    args: [
        5, 1, 0, 0, ['wnvt地址', 'tNULSeBaN8aNHMo4yKomvGDbZfL1KAYGwfn8Jk'], fromAddress, nuls.currentTime() + 300, 'tNULSeBaN5nddf9WkQgRr3RNwARgryndv2Bzs6'
    ]
}, 'swap nvt for nuls', multyAssets);
