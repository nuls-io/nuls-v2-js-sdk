const call = require('../contractCall.js');
const BigNumber = require("bignumber.js");
const nuls = require("../../index");
nuls.customnet(101, "https://api.itac.club/jsonrpc", undefined, 18, "ITAC");
require('dotenv').config({ path: '../../test/.env'});

async function approve(pri, mainContract, to) {
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
    let router = process.env.router;
    // await approve(process.env.asd, process.env.fark, router);// FARK
    // console.log('asd fark done.');
    // await approve(process.env.xaf, process.env.fark, router);// FARK
    // console.log('xaf fark done.');
    await approve(process.env.asd, process.env.ddd, router);// DDD
    console.log('asd ddd done.');
    // await approve(process.env.xaf, process.env.ddd, router);// DDD
    // console.log('xaf ddd done.');
    await approve(process.env.asd, process.env.ccc8, router);// CCC
    console.log('asd ccc done.');
    // await approve(process.env.xaf, process.env.ccc, router);// CCC
    // console.log('xaf ccc done.');
    await approve(process.env.asd, process.env.qqq, router);// QQQ
    console.log('asd qqq done.');
    // await approve(process.env.xaf, process.env.qqq, router);// QQQ
    // console.log('xaf qqq done.');
    // await approve(process.env.l24, process.env.AAA, router);// AAA
    // console.log('l24 AAA done.');
    // await approve(process.env.l24, process.env.www, router);// www
    // console.log('l24 www done.');
    // await approve(process.env.lrg, 'tNULSeBaMxs25kpN94U9uXArQ7QCGLsmPurRqt', router);// Pair.LPAddress

    // await approve(process.env.lrg, 'tNULSeBaN2QVohyKMFt24EgKzrwgww3xgbU97z', router);
    // console.log('lrg done.');
    // await approve(process.env.asd, 'tNULSeBaN2QVohyKMFt24EgKzrwgww3xgbU97z', router);
    // console.log('asd done.');
    // await approve(process.env.l24, 'tNULSeBaN2QVohyKMFt24EgKzrwgww3xgbU97z', router);
    // console.log('l24 done.');
    
    // await approve(process.env.xaf, 'tNULSeBaN2QVohyKMFt24EgKzrwgww3xgbU97z', router);
    // console.log('xaf done.');

    // await approve(process.env.tcl, 'tNULSeBaN2QVohyKMFt24EgKzrwgww3xgbU97z', router);
    // console.log('tcl done.');
    // await approve(process.env.buy9, 'tNULSeBaN2QVohyKMFt24EgKzrwgww3xgbU97z', router);
    // console.log('buy9 done.');

    // await approve('xxx', 'NULSd6HgtdUku4HecUgdTWiT7a8ieiZX1nVm7', 'NULSd6HgcFqUFG4gH8MWmu4hHqhx1o4uv5Dy2');
    console.log('xxx done.');
}

approveList();