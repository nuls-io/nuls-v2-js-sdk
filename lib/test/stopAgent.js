'use strict';

var nuls = require('../index');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    countFee = _require.countFee,
    inputsOrOutputs = _require.inputsOrOutputs,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx,
    agentDeposistList = _require.agentDeposistList;

/**
 * @disc: 注销节点 dome
 * @date: 2019-10-18 10:38
 * @author: Wave
 */

var pri = '777e333556edb17564ea45f84dce0f5fbea884123924575213c7a30cb3c9375410';
var pub = '027d8d404b0aaa834491999a0212ef7e432da69c6462857566f80a2c81e259e7b2';
var fromAddress = "NULSd6HgfzPGhFsZX16hHgneY25YKs6v6LvmX";
var amount = 2000000000000;
var remark = 'stop agent....';

//调用注销节点
stopAgent(pri, pub, fromAddress, 1, 1, amount, '7018c41307132d3e4709c3f50bae235e6f028a267b291930520bdb25f9d24195');

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
  //console.log(balanceInfo);
  var transferInfo = {
    fromAddress: fromAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 100000,
    depositHash: agentHash
  };
  var inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 9);
  //console.log(inOrOutputs);
  var newInputs = inOrOutputs.data.inputs;
  //console.log(newInputs);
  var newOutputs = [];
  //console.log(newOutputs);
  var depositList = await agentDeposistList(agentHash);
  //console.log(depositList);
  //console.log(depositList);
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

  var addressArr = [];
  var newOutputss = [];
  newOutputs.forEach(function (item) {
    var i = void 0;
    if ((i = addressArr.indexOf(item.address)) > -1) {
      //console.log(result, i);
      newOutputss[i].amount = Number(newOutputss[i].amount) + Number(item.amount);
    } else {
      addressArr.push(item.address);
      newOutputss.push({
        address: item.address,
        amount: item.amount,
        assetsChainId: item.assetsChainId,
        assetsId: item.assetsId,
        lockTime: item.lockTime
      });
    }
  });
  newOutputss.unshift(inOrOutputs.data.outputs[0]);

  //console.log(newInputs);
  //console.log(newOutputss);

  var tAssemble = await nuls.transactionAssemble(newInputs, newOutputss, remark, 9, agentHash);
  //console.log(tAssemble);
  var txhex = '';
  //获取手续费
  var newFee = countFee(tAssemble, 1);
  //手续费大于0.001的时候重新组装交易及签名
  if (transferInfo.fee !== newFee) {
    transferInfo.fee = newFee;
    inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 9);
    newInputs = inOrOutputs.data.inputs;
    newOutputs = inOrOutputs.data.outputs;
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
  //console.log(result);
  if (result) {
    var results = await broadcastTx(txhex);
    //console.log(results);
    if (results && result.value) {
      console.log("交易完成");
    } else {
      console.log("广播交易失败");
    }
  } else {
    console.log("验证交易失败");
  }
}