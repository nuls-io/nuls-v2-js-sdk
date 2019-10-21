'use strict';

var nuls = require('../index');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    countFee = _require.countFee,
    inputsOrOutputs = _require.inputsOrOutputs,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx;

/**
 * @disc: 转账 dome
 * @date: 2019-10-18 10:40
 * @author: Wave
 */

var pri = '9ce21dad67e0f0af2599b41b515a7f7018059418bab892a7b68f283d489abc4b';
var pub = '03958b790c331954ed367d37bac901de5c2f06ac8368b37d7bd6cd5ae143c1d7e3';
var fromAddress = "tNULSeBaMvEtDfvZuukDf2mVyfGo3DdiN8KLRG";
var toAddress = 'tNULSeBaMuBCG7NkSyufjE76CVbPQMrZ5Q1v3s';
var amount = 23000000000000;
var remark = '首先你得有一个需要配置自动更新功能的 electron 项目。这里我为了测试自动更新功能里我为了测试自动更新功能是否成功搭建使用的是里我为了测试自动更新功能是否成功搭建使用的是里我为了测试自动更新功能是否成功搭建使用的是里我为了测试自动更新功能是否成功搭建使用的是是否成功搭建使用的是 electron-vue 脚手架搭建的项目首先你得有一个需要配置自动更新功能的 electron 项目。这里我为了测试自动更新功能是否成功搭建使用的是 electron-vue 脚手架搭建的项目首先你得有一个需要配置自动更新功能的 electron 项目。这里我为了测试自动更新功能是否成功搭建使用的是 electron-vue 脚手架搭建的项目首先你得有一个需要配置自动更新功能的  electro';
//调用
transferTransaction(pri, pub, fromAddress, toAddress, 2, 1, amount, remark);

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
    fee: 100000
  };
  var inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 2);
  var tAssemble = []; //交易组装
  var txhex = ""; //交易签名
  if (inOrOutputs.success) {
    tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 2);
    //获取手续费
    var newFee = countFee(tAssemble, 1);
    //手续费大于0.001的时候重新组装交易及签名
    if (transferInfo.fee !== newFee) {
      transferInfo.fee = newFee;
      inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 2);
      tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 2);
      txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
    } else {
      txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
    }
  } else {
    console.log(inOrOutputs.data);
  }
  console.log(txhex);
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