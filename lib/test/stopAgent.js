'use strict';

var nuls = require('../index');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    countFee = _require.countFee,
    inputsOrOutputs = _require.inputsOrOutputs,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx,
    agentDeposistList = _require.agentDeposistList;

var pri = '411fa90f7161a20f4624a4f00167fac6d5afd97a7e6815f60e66106c559564a1';
var pub = '031c810153d633a5167ec629af771296bad4f26eacfe4034c978afee12b6c4fd44';
var fromAddress = "tNULSeBaMuBCG7NkSyufjE76CVbPQMrZ5Q1v3s";
var amount = 2000100000000;
var remark = 'stop agent....';

/**
 * 注销节点
 * @param pri
 * @param pub
 * @param fromAddress
 * @param assetsChainId
 * @param assetsId
 * @param amount
 * @param agentHash
 * @returns {Promise<void>}
 */
async function stopAgent(pri, pub, fromAddress, assetsChainId, assetsId, amount, agentHash) {
  var balanceInfo = await getNulsBalance(fromAddress);
  var transferInfo = {
    fromAddress: fromAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 100000,
    depositHash: agentHash
  };
  var inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 9);
  var newInputs = inOrOutputs.inputs;
  var newOutputs = inOrOutputs.outputs;
  var depositList = await agentDeposistList(agentHash);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = depositList.list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _itme = _step.value;

      newInputs.push({
        address: _itme.address,
        assetsChainId: assetsChainId,
        assetsId: assetsId,
        amount: _itme.amount,
        locked: -1,
        nonce: _itme.txHash.substring(agentHash.length - 16) //这里是hash的最后16个字符
      });
      newOutputs.push({
        address: _itme.address, assetsChainId: assetsChainId,
        assetsId: assetsId, amount: _itme.amount, lockTime: 0
      });
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

  var tAssemble = await nuls.transactionAssemble(newInputs, newOutputs, remark, 9, agentHash);
  var txhex = '';
  //获取手续费
  var newFee = countFee(tAssemble, 1);
  //手续费大于0.001的时候重新组装交易及签名
  if (transferInfo.fee !== newFee) {
    transferInfo.fee = newFee;
    inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 9);
    newInputs = inOrOutputs.inputs;
    newOutputs = inOrOutputs.outputs;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = depositList.list[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var itme = _step2.value;

        newInputs.push({
          address: itme.address,
          assetsChainId: assetsChainId,
          assetsId: assetsId,
          amount: itme.amount,
          locked: -1,
          nonce: itme.txHash.substring(agentHash.length - 16) //这里是hash的最后16个字符
        });
        newOutputs.push({
          address: itme.address, assetsChainId: assetsChainId,
          assetsId: assetsId, amount: itme.amount, lockTime: 0
        });
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    tAssemble = await nuls.transactionAssemble(newInputs, newOutputs, remark, 9, agentHash);
    txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  } else {
    txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  }
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

//调用注销节点
stopAgent(pri, pub, fromAddress, 2, 1, amount, '1c641f4b6ec42155e6c3e17b4f78db96353776c294a75c1dcca1f77f3f753545');