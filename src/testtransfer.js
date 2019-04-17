const nuls = require('./index');
const utils = require('./utils/utils');
const sdk = require("./api/sdk");
const txs = require("./model/txs");

let pri = '94d344417d6faa55e3017709dd6b837bac2bc1769e3a4b516ac9a981465ac03c';
let pub = '02403cb49ac24ff9555b073ce981e28bed5e81438b2c715a14d06bd248ea1d0091';
let fromAddress = "tNULSeBaMfwpGBmn8xuKABPWUbdtsM2cMoinnn";
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

    let tt = new txs.TransferTransaction();
    tt.setCoinData(inputs, outputs);
    tt.time = new Date().getTime();
    tt.remark = remark;
    sdk.signatureTx(tt, pri, pub);
    console.log(tt.txSerialize().toString('hex'));

}

//测试开始

transfer2(pri, pub, fromAddress, toAddress, 2, 1, amount, remark).then((response) => {
    console.log(response)
}).catch((error) => {
    console.log(error)
});