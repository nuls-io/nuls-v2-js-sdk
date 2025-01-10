const call = require('../../contractCall.js');
const BigNumber = require("bignumber.js");
const nuls = require("../../../index");
require('dotenv').config({ path: '../../../test/.env'});

async function approve(pri, mainContract, to) {
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

    await call.callContract(pri, pub, fromAddress, assetChainId, assetId, {
        chainId: assetChainId,
        sender: fromAddress,
        contractAddress: mainContract,
        value: 0, //
        methodName: "approve",
        methodDesc: "",
        args: [
            to, new BigNumber(0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff).toFixed()
        ]
    }, 'call contract...', []);
}

async function approveList() {
    const router = process.env.router;
    await approve(process.env.asd, process.env.qqq, router);
    // await approve(process.env.asd, 'tNULSxxxxx', router);// Pair [USDT, QQQ].LPAddress
}

approveList();