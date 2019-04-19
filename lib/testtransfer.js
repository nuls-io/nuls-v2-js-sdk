'use strict';

var nuls = require('./index');
var utils = require('./utils/utils');
var sdk = require("./api/sdk");
var txs = require("./model/txs");

var pri = '94d344417d6faa55e3017709dd6b837bac2bc1769e3a4b516ac9a981465ac03c';
var pub = '02403cb49ac24ff9555b073ce981e28bed5e81438b2c715a14d06bd248ea1d0091';
var fromAddress = "tNULSeBaMfwpGBmn8xuKABPWUbdtsM2cMoinnn";
var toAddress = 'tNULSeBaMp4u8yfeVPSWx1fZoVtfateY1ksNNN';
var amount = 1000000000;
var remark = 'niels test....';

//转账功能 trustUrl
async function transfer2(pri, pub, fromAddress, toAddress, assetsChainId, assetsId, amount, remark) {

  var balanceInfo = await nuls.getNulsBalance(fromAddress);
  var inputs = [];
  var fee = 100000;

  if (balanceInfo.balance < amount + fee) {
    return { success: false, data: "Your balance is not enough." };
  }

  inputs.push({
    address: fromAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount + fee,
    locked: 0,
    nonce: balanceInfo.nonce
  });

  var outputs = [{
    address: toAddress, assetsChainId: assetsChainId,
    assetsId: assetsId, amount: amount, lockTime: 0
  }];
  var txhex = await nuls.transferTransaction(pri, pub, inputs, outputs, remark);
  console.log(txhex);
  return 'done!';
}

//测试开始

transfer2(pri, pub, fromAddress, toAddress, 2, 1, amount, remark).then(function (response) {
  console.log(response);
}).catch(function (error) {
  console.log(error);
});