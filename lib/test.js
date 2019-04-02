'use strict';

var nuls = require('./index');
var utils = require('./utils/utils');

//创建地址
/*let passWord = '';
const newAddress = nuls.newAddress(passWord);
console.log(newAddress);*/

//导入地址
/*const key ="683766502db8e219936121170e2906fff6678455a3b0e9afc66bb841e661e8bd";
const importAddress = nuls.importByKey(key);
console.log(importAddress);*/

/**
 * from    TTamW5GY7RXwES6JsJwA9UHqTxGKMnKw
 * to      TTakMrubBXi998CZgaYdTy2Nrqwd2ptq
 * value   0.8
 * remark  remark....
 */

var pri = '683766502db8e219936121170e2906fff6678455a3b0e9afc66bb841e661e8bd';
var pub = '0358ded06b4477272fa20a0c70418f9392af40e67ba79c705702b275a5a4d7fc5b';
var fromAddress = 'TTamW5GY7RXwES6JsJwA9UHqTxGKMnKw';
var toAddress = 'TTakMrubBXi998CZgaYdTy2Nrqwd2ptq';
var amount = 8000000;
var remark = 'remark....';

//转账功能 trustUrl
async function transfer(pri, pub, fromAddress, toAddress, amount, remark) {
  var inputUtxoInfo = await nuls.getInputUtxo(fromAddress, amount);
  var inputOwner = [];
  var totalValue = 0;
  var fee = 100000;
  //判断是否零钱过多
  if (inputUtxoInfo.length >= 6000) {
    return { success: false, data: "Too much change to consume" };
  } else {
    //计算手续费 （124 + 50  * inputs.length + 38 * outputs.length + remark.bytes.length ）/1024
    fee = Math.ceil((124 + 50 * inputUtxoInfo.length + 38 * 2 + +utils.stringToByte(remark).length) / 1024) * 100000;
  }
  //计算转账金额需要的inputUtxo
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = inputUtxoInfo[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var item = _step.value;

      totalValue = totalValue + item.value;
      inputOwner.push({ owner: item.owner, na: item.value, lockTime: item.lockTime });
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var outputOwner = [{ owner: toAddress, na: amount, lockTime: 0 }];
  //计算多余的金额并返回
  if (totalValue - amount > 0) {
    outputOwner.push({ owner: fromAddress, na: totalValue - amount - fee, lockTime: 0 });
  }
  var hashOrSignature = nuls.transferTransaction(pri, pub, inputOwner, outputOwner, remark);
  //验证交易
  var valiTransactions = await nuls.valiTransaction(hashOrSignature.signature);
  //验证交易成功
  if (valiTransactions.data.success) {
    //广播交易
    var broadcastInfo = await nuls.broadcast(hashOrSignature.signature);
    return broadcastInfo.data;
  } else {
    return { success: false, data: "verify transaction failure" };
  }
}

//测试开始

transfer(pri, pub, fromAddress, toAddress, amount, remark).then(function (response) {
  console.log(response);
}).catch(function (error) {
  console.log(error);
});