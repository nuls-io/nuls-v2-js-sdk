'use strict';

var nuls = require('../index');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    inputsOrOutputs = _require.inputsOrOutputs,
    validateContractDelete = _require.validateContractDelete,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx;

/**
 * @disc: 删除合约 dome
 * @date: 2019-10-18 10:31
 * @author: Wave
 */


var pri = '76b7beaa98db863fb680def099af872978209ed9422b7acab8ab57ad95ab218b';
var pub = '02ec9e957823cd30d809f44830442562ca5bf42530251247b35d9209690f39be67';
var fromAddress = "tNULSeBaMqywZjfSrKNQKBfuQtVxAHBQ8rB2Zn";
var remark = 'delete contract...';

var contractDelete = {
  chainId: 2,
  sender: fromAddress,
  contractAddress: "tNULSeBaNA1fArRNjbHrDi3ZTdQiM26harbwnD"
};

//合约删除
deleteContract(pri, pub, fromAddress, 2, 1, contractDelete);

/**
 * 组装创建合约交易的txData
 * @param chainId
 * @param sender
 * @param contractAddress
 * @returns {Promise<{}>}
 */
async function makeDeleteData(chainId, sender, contractAddress) {
  var contractDelete = {};
  contractDelete.chainId = chainId;
  contractDelete.sender = sender;
  contractDelete.contractAddress = contractAddress;
  return contractDelete;
}

/**
 * 调用删除合约
 * @param pri
 * @param pub
 * @param fromAddress
 * @param assetsChainId
 * @param assetsId
 * @param contractDelete
 * @returns {Promise<void>}
 */
async function deleteContract(pri, pub, fromAddress, assetsChainId, assetsId, contractDelete) {
  var balanceInfo = await getNulsBalance(fromAddress);
  var amount = 0;
  var transferInfo = {
    fromAddress: fromAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 100000
  };

  var deleteValidateResult = await validateContractDelete(assetsChainId, contractDelete.sender, contractDelete.contractAddress);
  if (!deleteValidateResult) {
    console.log("验证删除合约失败");
    return;
  }
  var inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 17);
  var tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 17, contractDelete);
  var txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  var result = await validateTx(txhex);
  console.log(result);
  if (result) {
    var results = await broadcastTx(txhex);
    if (results && results.value) {
      console.log("交易完成");
    } else {
      console.log("广播交易失败");
    }
  } else {
    console.log("验证交易失败");
  }
}