const call = require('../../contractCall.js');
const BigNumber = require("bignumber.js");
const nuls = require("../../../index");
require('dotenv').config({ path: '../../../test/.env'});

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

//Address tokenA, Address tokenB, BigInteger amountADesired, BigInteger amountBDesired, BigInteger amountAMin, BigInteger amountBMin, Address to, BigInteger deadline
async function addFarkAndQQQ() {
    await call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
        chainId: assetChainId,
        sender: fromAddress,
        contractAddress: mainContract,
        value: 0, //
        methodName: "addLiquidity",
        methodDesc: "",
        args: [
            process.env.fark, process.env.qqq, new BigNumber("500").shiftedBy(18).toFixed(), new BigNumber("10000").shiftedBy(18).toFixed(), 0, 0, fromAddress, nuls.currentTime() + 300
        ]
    }, 'add lp fark(500) and qqq(10000)', []);
}

async function addFarkAndCcc() {
    await call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
        chainId: assetChainId,
        sender: fromAddress,
        contractAddress: mainContract,
        value: 0, //
        methodName: "addLiquidity",
        methodDesc: "",
        args: [
            process.env.fark, process.env.ccc, new BigNumber("50").shiftedBy(18).toFixed(), new BigNumber("100").shiftedBy(8).toFixed(), 0, 0, fromAddress, nuls.currentTime() + 300
        ]
    }, 'add lp fark(50) and ccc(100)', []);
}

addFarkAndQQQ();