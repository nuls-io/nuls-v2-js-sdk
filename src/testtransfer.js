const nuls = require('./index');
const utils = require('./utils/utils');
const sdk = require("./api/sdk");

let pri = 'fbaec43dff97f5e72657f22a9fb76bf712595774f6a03208be025a0094a5e85a';
let pub = '03457c1c44c2c7fdc3503b55a583bc83bf4b2f32f23ad5788d422a7b6d635446cf';
let fromAddress = 'tNULSeBaMrUCMMVjEjJeHyp9r5NCAbJ3rD3R3S';
let toAddress = 'tNULSeBaMp4u8yfeVPSWx1fZoVtfateY1ksNNN';
let amount = 100000000;
let remark = 'niels test....';

//转账功能 trustUrl
async function transfer2(pri, pub, fromAddress, toAddress, assetsChainId, assetsId, amount, remark) {
    const balanceInfo = await nuls.getNulsBalance(fromAddress);
    let inputs = [];
    let fee = 100000;

    if (balanceInfo.balance < amount + fee) {
        return {success: false, data: "Your balance is not enough."}
    }

    inputs.push({
        address: fromAddress,
        assetsChainId: assetsChainId,
        assetsId: assetsId,
        amount: amount + fee,
        locked: 0,
        nonce: balanceInfo.nonce
    });

    let outputs = [
        {
            address: toAddress, assetsChainId: assetsChainId,
            assetsId: assetsId, amount: amount, lockTime: 0
        }
    ];

    let tt = new TransferTransaction();
    tt.setCoinData(inputs, outputs);
    tt.time = new Date().getTime();
    tt.remark = remark;
    tt.signatures = sdk.signatureTx(tt, pri, pub);


}

//测试开始

transfer2(pri, pub, fromAddress, toAddress, amount, remark).then((response) => {
    console.log(response)
}).catch((error) => {
    console.log(error)
});