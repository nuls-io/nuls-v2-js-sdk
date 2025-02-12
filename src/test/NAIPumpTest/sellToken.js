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
const mainContract = 'tNULSeBaN26qVMgnxi1AxS1PDfXn2Kpu6YZyud';

// 要卖出的token数量
const amount = new BigNumber("20000000").shiftedBy(8).toFixed();
// 期望得到的NULS数量
const expectReceive = 0;
// 接受的滑点损失
const slippage = 0;

// sellToken(BigInteger amount, BigInteger expectReceive, int slippage)
call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: mainContract,
    value: '0',
    methodName: "sellToken",
    methodDesc: "",
    args: [
        amount, expectReceive, slippage
    ]
}, 'call contract...', []);

