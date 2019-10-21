'use strict';

var nuls = require('../index');
var txs = require('../model/txs');
var Serializers = require("../api/serializers");

var _require = require('./api/util'),
    isMainNet = _require.isMainNet,
    countCtxFee = _require.countCtxFee,
    getBalance = _require.getBalance,
    broadcastTx = _require.broadcastTx,
    sendCrossTx = _require.sendCrossTx;

/** * @disc: 跨链交易 dome * @date: 2019-10-18 10:32 * @author: Wave */

/*let pri = '9ce21dad67e0f0af2599b41b515a7f7018059418bab892a7b68f283d489abc4b';//tNULSeBaMvEtDfvZuukDf2mVyfGo3DdiN8KLRGlet pub = '03958b790c331954ed367d37bac901de5c2f06ac8368b37d7bd6cd5ae143c1d7e3';let fromAddress = "tNULSeBaMvEtDfvZuukDf2mVyfGo3DdiN8KLRG";let toAddress = '8CPcA7kaXSHbWb3GHP7bd5hRLFu8RZv57rY9w';*/


var pri = "94bb1af12b9099d9c28c436e5613661253a7b3f45a4c2534a0f08a996518bb37"; //8CPcA7kaXSHbWb3GHP7bd5hRLFu8RZv57rY9w
var pub = '0398d4c2f8fa788a5f314bd40da588fa0991f2b4fdf7dbf25abce5ecc8cf129d00';
var fromAddress = "LINcjJR3SA4Ui6z5kcGmYm459z7JGQPxuxRC";
var toAddress = 'tNULSeBaMvEtDfvZuukDf2mVyfGo3DdiN8KLRG';
var amount = 8800000000;
var remark = '跨链交易测试....';

var transferInfo = {
  fromAddress: fromAddress,
  toAddress: toAddress,
  assetsChainId: 8,
  assetsId: 1,
  amount: amount,
  remark: remark,
  fee: 1000000
};

//调用
transferTransaction(pri, pub, 2, transferInfo);

/** * 转账交易 * @param pri * @param pub * @param chainId * @param transferInfo * @returns {Promise<void>} */
async function transferTransaction(pri, pub, chainId, transferInfo) {
  //账户转出资产余额
  //console.log(transferInfo);
  var balanceInfo = await getBalance(8, transferInfo.assetsChainId, transferInfo.assetsId, transferInfo.fromAddress);

  var inputs = [];
  var outputs = [{
    address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
    assetsChainId: transferInfo.assetsChainId,
    assetsId: transferInfo.assetsId,
    amount: transferInfo.amount,
    lockTime: 0
  }];

  var mainNetBalanceInfo = await getBalance(8, 2, 1, transferInfo.fromAddress);
  var localBalanceInfo = void 0;
  //如果不是主网需要收取NULS手续费
  if (!isMainNet(chainId)) {
    if (mainNetBalanceInfo.balance < transferInfo.fee) {
      console.log("余额不足");
      return;
    }
  }

  //如果转出资产为本链主资产，则直接将手续费加到转出金额上
  if (chainId === transferInfo.assetsChainId && transferInfo.assetsId === 1) {
    var newAmount = transferInfo.amount + transferInfo.fee;
    if (balanceInfo.balance < transferInfo.amount + transferInfo.fee) {
      console.log("余额不足");
      return;
    }
    //转出的本链资产 = 转出资产amount + 本链手续费
    inputs.push({
      address: transferInfo.fromAddress,
      assetsChainId: transferInfo.assetsChainId,
      assetsId: transferInfo.assetsId,
      amount: newAmount,
      locked: 0,
      nonce: balanceInfo.nonce
    });
    //如果不是主网需收取主网NULS手续费
    if (!isMainNet(chainId)) {
      inputs.push({
        address: transferInfo.fromAddress,
        assetsChainId: 2,
        assetsId: 1,
        amount: transferInfo.fee,
        locked: 0,
        nonce: mainNetBalanceInfo.nonce
      });
    }
  } else {
    localBalanceInfo = await getBalance(8, chainId, 1, transferInfo.fromAddress);
    if (localBalanceInfo.balance < transferInfo.fee) {
      console.log("该账户本链主资产不足够支付手续费！");
      return;
    }
    //如果转出的是NULS，则需要把NULS手续费添加到转出金额上
    if (transferInfo.assetsChainId === 2 && transferInfo.assetsId === 1) {
      var _newAmount = transferInfo.amount + transferInfo.fee;
      if (mainNetBalanceInfo.balance < _newAmount) {
        console.log("余额不足");
        return;
      }
      inputs.push({
        address: transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: _newAmount,
        locked: 0,
        nonce: mainNetBalanceInfo.nonce
      });
    } else {
      inputs.push({
        address: transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: transferInfo.amount,
        locked: 0,
        nonce: balanceInfo.nonce
      });
      inputs.push({
        address: transferInfo.fromAddress,
        assetsChainId: 2,
        assetsId: 1,
        amount: transferInfo.fee,
        locked: 0,
        nonce: mainNetBalanceInfo.nonce
      });
    }
    //本链主资产手续费
    if (!isMainNet(chainId)) {
      inputs.push({
        address: transferInfo.fromAddress,
        assetsChainId: chainId,
        assetsId: 1,
        amount: transferInfo.fee,
        locked: 0,
        nonce: localBalanceInfo.nonce
      });
    }
  }

  var tAssemble = await nuls.transactionAssemble(inputs, outputs, transferInfo.remark, 10); //交易组装
  var ctxSign = ""; //本链协议交易签名
  var mainCtxSign = ""; //主网协议交易签名
  var bw = new Serializers();
  var mainCtx = new txs.CrossChainTransaction();
  var pubHex = Buffer.from(pub, 'hex');
  var newFee = 0;
  if (isMainNet(chainId)) {
    newFee = countCtxFee(tAssemble, 1);
  } else {
    newFee = countCtxFee(tAssemble, 2);
    mainCtx.time = tAssemble.time;
    mainCtx.remark = tAssemble.remark;
    var mainNetInputs = [];
    if (transferInfo.assetsChainId === 2 && transferInfo.assetsId === 1) {
      mainNetInputs.push({
        address: transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: transferInfo.amount + newFee,
        locked: 0,
        nonce: mainNetBalanceInfo.nonce
      });
    } else {
      mainNetInputs = [{
        address: transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: transferInfo.amount,
        locked: 0,
        nonce: balanceInfo.nonce
      }, {
        address: transferInfo.fromAddress,
        assetsChainId: 2,
        assetsId: 1,
        amount: newFee,
        locked: 0,
        nonce: mainNetBalanceInfo.nonce
      }];
    }
    mainCtx.setCoinData(mainNetInputs, outputs);
  }

  //如果手续费发生改变，重新组装CoinData
  if (transferInfo.fee !== newFee) {
    if (chainId === transferInfo.assetsChainId && transferInfo.assetsId === 1) {
      if (balanceInfo.balance < transferInfo.amount + newFee) {
        console.log("余额不足");
        return;
      }
      inputs[0].amount = transferInfo.amount + newFee;
      if (!isMainNet(chainId)) {
        inputs[1].amount = newFee;
      }
    } else {
      if (localBalanceInfo.balance < transferInfo.fee) {
        console.log("该账户本链主资产不足够支付手续费！");
        return;
      }
      if (transferInfo.assetsChainId === 2 && transferInfo.assetsId === 1) {
        if (mainNetBalanceInfo.balance < transferInfo.amount + newFee) {
          console.log("余额不足");
          return;
        }
        inputs[0].amount = transferInfo.amount + newFee;
        inputs[1].amount = newFee;
      } else {
        inputs[1].amount = newFee;
        inputs[2].amount = newFee;
      }
    }
    tAssemble = await nuls.transactionAssemble(inputs, outputs, transferInfo.remark, 10);
    ctxSign = nuls.transactionSignature(pri, tAssemble);
  } else {
    ctxSign = nuls.transactionSignature(pri, tAssemble);
  }
  bw.writeBytesWithLength(pubHex);
  bw.writeBytesWithLength(ctxSign);
  if (!isMainNet(chainId)) {
    mainCtx.txData = tAssemble.getHash();
    mainCtxSign = nuls.transactionSignature(pri, mainCtx);
    bw.writeBytesWithLength(pubHex);
    bw.writeBytesWithLength(mainCtxSign);
  }
  tAssemble.signatures = bw.getBufWriter().toBuffer();
  var txHex = tAssemble.txSerialize().toString('hex');
  var result = await sendCrossTx(txHex);
  console.log(result);
  if (result.success) {
    console.log(result.data.value);
    var results = await broadcastTx(txHex);
    if (results && results.value) {
      console.log("交易完成");
    } else {
      console.log("广播交易失败");
    }
  } else {
    console.log("验证交易失败:" + result.error);
  }
}