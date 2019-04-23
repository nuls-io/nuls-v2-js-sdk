'use strict';

var nuls = require('../index');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    countFee = _require.countFee,
    inputsOrOutputs = _require.inputsOrOutputs,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx;

var pri = '411fa90f7161a20f4624a4f00167fac6d5afd97a7e6815f60e66106c559564a1';
var pub = '031c810153d633a5167ec629af771296bad4f26eacfe4034c978afee12b6c4fd44';
var fromAddress = "tNULSeBaMuBCG7NkSyufjE76CVbPQMrZ5Q1v3s";
var toAddress = 'tNULSeBaMp4u8yfeVPSWx1fZoVtfateY1ksNNN';
var amount = 110000000;
var remark = 'transfer test....';

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
  var txhex = "";
  if (inOrOutputs.success) {
    txhex = await nuls.transactionSerialize(pri, pub, inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 2);
  } else {
    console.log(inOrOutputs.data);
  }
  //console.log(txhex);
  var result = await validateTx(txhex);
  if (result.success) {
    console.log(result.data.value);
    var results = await broadcastTx(txhex);
    if (results && results.value) {
      console.log("交易完成");
    } else {
      console.log("广播交易失败");
    }
  } else {
    console.log("验证交易失败:" + result.error);
  }
}

//调用
transferTransaction(pri, pub, fromAddress, toAddress, 2, 1, amount, remark);