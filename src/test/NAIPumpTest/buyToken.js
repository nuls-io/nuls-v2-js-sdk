const call = require('../contractCall.js');
const BigNumber = require("bignumber.js");
const nuls = require("../../index");
require('dotenv').config({ path: '../../test/.env'});

// 用户私钥
const pri = process.env.l24;
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
const mainContract = 'tNULSeBaN26qVMgnxi1AxS1PDfXn2Kpu6YZyud';

// 期望得到的token数量
let expectAmount = new BigNumber("0").shiftedBy(8).toFixed();
// 接受的滑点损失
let slippage = 0;
// 支付的NULS数量
let payNULS = 50;

// buyToken( BigInteger expectAmount, int slippage, Address receiver)
call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: mainContract,
    value: new BigNumber(payNULS).shiftedBy(8).toFixed(),
    methodName: "buyToken",
    methodDesc: "",
    args: [
        expectAmount, slippage, ''
    ]
}, 'call contract...', []);

