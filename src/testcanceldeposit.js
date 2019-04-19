const nuls = require('./index');
const utils = require('./utils/utils');
const sdk = require("./api/sdk");
const txs = require("./model/txs");

let pri = '94d344417d6faa55e3017709dd6b837bac2bc1769e3a4b516ac9a981465ac03c';
let pub = '02403cb49ac24ff9555b073ce981e28bed5e81438b2c715a14d06bd248ea1d0091';
let fromAddress = "tNULSeBaMfwpGBmn8xuKABPWUbdtsM2cMoinnn";

let amount = 20000100000000;
let remark = 'niels test alias....';

//转账功能 trustUrl
async function doit(pri, pub, fromAddress, assetsChainId, assetsId, amount, depositHash) {

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
        amount: amount,
        locked: -1,
        nonce: depositHash.substring(depositHash.length-16)//这里是hash的最后16个字符
    });

    let outputs = [
        {
            address: fromAddress, assetsChainId: assetsChainId,
            assetsId: assetsId, amount: amount - fee, lockTime: 0
        }
    ];

    let tt = new txs.WithdrawTransaction(depositHash);
    tt.time = 123456789;
    tt.setCoinData(inputs, outputs);
    tt.remark = remark;
    sdk.signatureTx(tt, pri, pub);
    let txhex = tt.txSerialize().toString('hex');
    let result = await nuls.validateTx(txhex);
    if (result&&result.value) {
        console.log(result.value)
        nuls.broadcastTx(txhex);
    }else{
        console.log("opration failed!")
    }
    console.log(txhex);
    return 'done!';
}

//测试开始
doit(pri, pub, fromAddress, 2, 1, amount, 'e1d329c9c32bf0c19415db8d854b5b0af100f3798bf81ddb545e42146965c28a').then((response) => {
    console.log(response)
}).catch((error) => {
    console.log(error)
});