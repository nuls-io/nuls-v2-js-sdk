const call = require('../../contractCall.js');
const BigNumber = require("bignumber.js");
const nuls = require("../../../index");
require('dotenv').config({ path: '../../../test/.env'});

// 用户私钥
const pri = process.env.lrg;
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

//Integer chainId, Integer assetId, BigInteger amountOutMin, String[] path, Address to, BigInteger deadline, Address ref
call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: mainContract,
    value: new BigNumber("6").shiftedBy(8).toFixed(), //
    methodName: "swapExactNulsForWAsset",
    methodDesc: "",
    args: [
        //Integer chainId, Integer assetId, BigInteger amountOutMin, String[] path, Address to, BigInteger deadline, Address ref
        5, 163, 0, [process.env.wnuls, process.env._5_163], fromAddress, nuls.currentTime() + 300, 'tNULSeBaMtsAgkKKd2Qr5uVsMm5V7V3m8QN49K'
    ]
}, 'swap nuls for nvt', []);
