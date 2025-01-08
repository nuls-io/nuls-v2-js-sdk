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
const mainContract = 'tNULSeBaN45qZwijawwFc3UtPX8mZAUJk3bbfJ';

//Address tokenA, Address tokenB, BigInteger amountADesired, BigInteger amountBDesired, BigInteger amountAMin, BigInteger amountBMin, Address to, BigInteger deadline
call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: mainContract,
    value: 0, //
    methodName: "addLiquidity",
    methodDesc: "",
    args: [
        'tNULSeBaMy1Rk3KaHcvXYTGNoNpr8ckAzkKWfS', 'tNULSeBaN8Ps39De43Gik5GfQ6h4GYsHGmwNcP', new BigNumber("50").shiftedBy(18).toFixed(), new BigNumber("100").shiftedBy(8).toFixed(), 0, 0, fromAddress, nuls.currentTime() + 300
    ]
}, 'add lp fark and ccc', []);
