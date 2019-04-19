'use strict';

var nuls = require('./index');
var utils = require('./utils/utils');
var sdk = require("./api/sdk");
var txs = require("./model/txs");

var pri = '94d344417d6faa55e3017709dd6b837bac2bc1769e3a4b516ac9a981465ac03c';
var pub = '02403cb49ac24ff9555b073ce981e28bed5e81438b2c715a14d06bd248ea1d0091';
var fromAddress = "tNULSeBaMfwpGBmn8xuKABPWUbdtsM2cMoinnn";

var amount = 2000100000000;
var remark = 'niels test alias....';

//转账功能 trustUrl
async function doit(pri, pub, fromAddress, assetsChainId, assetsId, amount, agentHash) {

    var balanceInfo = await nuls.getNulsBalance(fromAddress);
    var fee = 100000;

    if (balanceInfo.balance < amount + fee) {
        return { success: false, data: "Your balance is not enough." };
    }
    var depositList = await nuls.getAgentDeposistList(agentHash);
    var inputs = new Array();
    var outputs = new Array();
    inputs.push({
        address: fromAddress,
        assetsChainId: assetsChainId,
        assetsId: assetsId,
        amount: amount,
        locked: -1,
        nonce: agentHash.substring(agentHash.length - 16) //这里是hash的最后16个字符
    });

    outputs.push({
        address: fromAddress, assetsChainId: assetsChainId,
        assetsId: assetsId, amount: amount - fee, lockTime: 0
    });

    for (var i = 0; i < depositList.length; i++) {
        var dpt = depositList[i];
        inputs.push({
            address: dpt.address,
            assetsChainId: assetsChainId,
            assetsId: assetsId,
            amount: dpt.amount,
            locked: -1,
            nonce: dpt.txHash.substring(agentHash.length - 16) //这里是hash的最后16个字符
        });

        outputs.push({
            address: dpt.address, assetsChainId: assetsChainId,
            assetsId: assetsId, amount: dpt.amount, lockTime: 0
        });
    }

    var tt = new txs.StopAgentTransaction(agentHash);
    tt.time = 123456789;
    tt.setCoinData(inputs, outputs);
    tt.remark = remark;
    sdk.signatureTx(tt, pri, pub);
    var txhex = tt.txSerialize().toString('hex');
    var result = await nuls.validateTx(txhex);
    if (result.value) {
        console.log(result.value);
        nuls.broadcastTx(txhex);
    }
    console.log(txhex);
    return 'done!';
}

//测试开始
doit(pri, pub, fromAddress, 2, 1, amount, '121d5252544c51204356c61e092d043ec63ef86639e57f2a692e8ad67367e597').then(function (response) {
    console.log(response);
}).catch(function (error) {
    console.log(error);
});