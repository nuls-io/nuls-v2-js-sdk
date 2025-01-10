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
const mainContract = process.env.router;

async function swapFarkForNuls() {
    await call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
        chainId: assetChainId,
        sender: fromAddress,
        contractAddress: mainContract,
        value: 0, //
        methodName: "swapExactTokensForNuls",
        methodDesc: "",
        args: [
            new BigNumber(1).shiftedBy(18).toFixed(), 0, [process.env.fark, process.env.wnuls], fromAddress, nuls.currentTime() + 300, 'tNULSeBaN5nddf9WkQgRr3RNwARgryndv2Bzs6'
        ]
    }, 'swap fark for nuls', []);
}

async function swapCCCForNuls() {
    await call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
        chainId: assetChainId,
        sender: fromAddress,
        contractAddress: mainContract,
        value: 0, //
        methodName: "swapExactTokensForNuls",
        methodDesc: "",
        args: [
            new BigNumber(1).shiftedBy(8).toFixed(), 0, [process.env.ccc, process.env.fark, process.env.wnuls], fromAddress, nuls.currentTime() + 300, 'tNULSeBaN5nddf9WkQgRr3RNwARgryndv2Bzs6'
        ]
    }, 'swap ccc for nuls: ccc to fark to nuls', []);
}

swapCCCForNuls();