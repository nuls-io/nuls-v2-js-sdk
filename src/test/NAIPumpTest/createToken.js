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
const mainContract = 'tNULSeBaN11T1Y6o9xJf8empYK8acJdykYr7kR';
// 发布token时，项目方支付NULS购买token（可填0）
const buyTokenPay = new BigNumber("50").shiftedBy(8).toFixed();
// 发布token
// String name, String tick, String logoUri, String extendUri
call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: mainContract,
    value: buyTokenPay, 
    methodName: "createToken",
    methodDesc: "",
    args: [
        'T2_A6J2_name', 'T2_A6J2', 'uritest', 'extendUriTest'
    ]
}, 'call contract...', []);
