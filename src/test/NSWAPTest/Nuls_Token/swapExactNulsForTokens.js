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

async function swapNulsForFark() {
    await call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
        chainId: assetChainId,
        sender: fromAddress,
        contractAddress: mainContract,
        value: new BigNumber(100).shiftedBy(8).toFixed(), //
        methodName: "swapExactNulsForTokens",
        methodDesc: "",
        args: [
            0, [process.env.wnuls, process.env.fark], fromAddress, nuls.currentTime() + 300, 'tNULSeBaN5nddf9WkQgRr3RNwARgryndv2Bzs6'
        ]
    }, 'swap nuls(1) for fark', []);
}


async function swapNulsForCCC() {
    await call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
        chainId: assetChainId,
        sender: fromAddress,
        contractAddress: mainContract,
        value: new BigNumber(1).shiftedBy(8).toFixed(), //
        methodName: "swapExactNulsForTokens",
        methodDesc: "",
        args: [
            0, [process.env.wnuls, process.env.fark, process.env.ccc], fromAddress, nuls.currentTime() + 300, 'tNULSeBaN5nddf9WkQgRr3RNwARgryndv2Bzs6'
        ]
    }, 'swap nuls for ccc: nuls to fark to ccc', []);
}

swapNulsForFark();
// swapNulsForCCC();
