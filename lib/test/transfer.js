'use strict';

var nuls = require('../index');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    countFee = _require.countFee,
    inputsOrOutputs = _require.inputsOrOutputs,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx;

var pri = '94d344417d6faa55e3017709dd6b837bac2bc1769e3a4b516ac9a981465ac03c';
var pub = '02403cb49ac24ff9555b073ce981e28bed5e81438b2c715a14d06bd248ea1d0091';
var fromAddress = "tNULSeBaMfwpGBmn8xuKABPWUbdtsM2cMoinnn";
var toAddress = 'tNULSeBaMp4u8yfeVPSWx1fZoVtfateY1ksNNN';
var amount = 1000000000;
var remark = 'niels test....';
/**
 * 转账交易
 * @param pri
 * @param pub
 * @param fromAddress
 * @param toAddress
 * @param assetsChainId
 * @param assetsId
 * @param amount
 * @param remark
 * @returns {Promise<void>}
 */
async function transferTransaction(pri, pub, fromAddress, toAddress, assetsChainId, assetsId, amount, remark) {
  var balanceInfo = await getNulsBalance(fromAddress);
  var transferInfo = {
    fromAddress: fromAddress,
    toAddress: toAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: countFee()
  };
  var inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 2);
  var txhex = await nuls.transactionSerialize(pri, pub, inOrOutputs.inputs, inOrOutputs.outputs, remark, 2);
  //console.log(txhex);
  var result = await validateTx(txhex);
  if (result) {
    console.log(result.value);
    var results = await broadcastTx(txhex);
    if (results && result.value) {
      console.log("交易完成");
    } else {
      console.log("广播交易失败");
    }
  } else {
    console.log("验证交易失败");
  }
}

//调用
transferTransaction(pri, pub, fromAddress, toAddress, 2, 1, amount, remark);