const call = require('../contractCall.js');
const BigNumber = require("bignumber.js");
const nuls = require("../../index");
require('dotenv').config({ path: '../../test/.env'});

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
const mainContract = 'tNULSeBaMyqgRwmgPGnaibP2vR4H2ePqQivbot';

const price = 600;// mint一个nft需要的nuls数量
const maxTotalSupply = 100;// 发行总量
const tigerMode = true;// 是否开启老虎机模式
const mintEndingProgress = 6000;// mint阶段比例，万分位
const swapFeeRate = 30;// 买卖阶段手续费不理，百分位
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
        'uritest', 'extendUriTest', 'token1n', 'token1s', '2-1', new BigNumber(price).shiftedBy(8).toFixed(), maxTotalSupply, tigerMode, mintEndingProgress, swapFeeRate
    ]
}, 'call contract...', []);
