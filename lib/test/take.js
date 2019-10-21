'use strict';

var nuls = require('../index');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    inputsOrOutputs = _require.inputsOrOutputs,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx;

/**
 * @disc: 退出共识 dome
 * @date: 2019-10-18 10:39
 * @author: Wave
 */

var pri = '94d344417d6faa55e3017709dd6b837bac2bc1769e3a4b516ac9a981465ac03c';
var pub = '02403cb49ac24ff9555b073ce981e28bed5e81438b2c715a14d06bd248ea1d0091';
var fromAddress = "tNULSeBaMfwpGBmn8xuKABPWUbdtsM2cMoinnn";
var amount = 210000000000;
var remark = 'niels test alias....';

//退出共识
take(pri, pub, fromAddress, 2, 1, amount, 'f556c7d05dd30c1080759e88e5934ff8981df2bf0dabd287dfee63b490bece50');

/**
 * 退出共识
 * @param pri
 * @param pub
 * @param fromAddress
 * @param assetsChainId
 * @param assetsId
 * @param amount
 * @param depositHash
 * @returns {Promise<void>}
 */
async function take(pri, pub, fromAddress, assetsChainId, assetsId, amount, depositHash) {
  var balanceInfo = await getNulsBalance(fromAddress);
  var transferInfo = {
    fromAddress: fromAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 100000,
    depositHash: depositHash
  };
  var inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 6);
  var tAssemble = await nuls.transactionAssemble(inOrOutputs.inputs, inOrOutputs.outputs, remark, 6, depositHash);
  var txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
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