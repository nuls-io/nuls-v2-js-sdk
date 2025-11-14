const call = require('../../contractCall.js');
const BigNumber = require("bignumber.js");
const nuls = require("../../../index");
nuls.customnet(101, "https://api.itac.club/jsonrpc", undefined, 18, "ITAC");
require('dotenv').config({ path: '../../../test/.env'});

// 用户私钥
const pri = process.env.asd;
const importAddress = nuls.importByKey(nuls.chainId(), pri, '', nuls.prefix());
// 用户公钥
const pub = importAddress.pub;
// 用户地址
const fromAddress = importAddress.address;
console.log('fromAddress', fromAddress);
// 资产链ID
const assetChainId = nuls.chainId();
// 资产ID
const assetId = 1;
const mainContract = process.env.router;

call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: mainContract,
    value: new BigNumber(800).shiftedBy(nuls.decimals()).toFixed(), //
    methodName: "addLiquidityNuls",
    methodDesc: "",
    args: [
        process.env.ddd, new BigNumber(1300).shiftedBy(18).toFixed(), 0, 0, fromAddress, nuls.currentTime() + 300
    ]
}, 'add lp nuls(800) and ddd(1300)', []);
