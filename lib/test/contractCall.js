'use strict';

var _bignumber = require('bignumber.js');

var nuls = require('../index');
var utils = require('../utils/utils');
var sdk = require('../api/sdk');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    countFee = _require.countFee,
    inputsOrOutputs = _require.inputsOrOutputs,
    getContractMethodArgsTypes = _require.getContractMethodArgsTypes,
    validateContractCall = _require.validateContractCall,
    imputedContractCallGas = _require.imputedContractCallGas,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx;

var pri = '76b7beaa98db863fb680def099af872978209ed9422b7acab8ab57ad95ab218b';
var pub = '02ec9e957823cd30d809f44830442562ca5bf42530251247b35d9209690f39be67';
var fromAddress = "tNULSeBaMqywZjfSrKNQKBfuQtVxAHBQ8rB2Zn";
var remark = 'call contract...';

/**
 * 预估调用合约的gas
 */
async function imputedCallGas(chainId, sender, value, contractAddress, methodName, methodDesc, args) {
  var result = await validateContractCall(chainId, sender, value, sdk.CONTRACT_MAX_GASLIMIT, sdk.CONTRACT_MINIMUM_PRICE, contractAddress, methodName, methodDesc, args);
  if (result && result.value) {
    return await imputedContractCallGas(chainId, sender, value, contractAddress, methodName, methodDesc, args);
  } else {
    //todo throw exception
    console.log("调用合约验证失败");
  }
}

/**
 * 组装创建合约交易的txData
 */
async function makeCallData(chainId, sender, value, contractAddress, methodName, methodDesc, args) {
  var contractCall = {};
  contractCall.chainId = chainId;
  contractCall.sender = sender;
  contractCall.contractAddress = contractAddress;
  contractCall.value = value;
  contractCall.gasLimit = imputedCallGas(chainId, sender, value, contractAddress, methodName, methodDesc, args);
  contractCall.price = sdk.CONTRACT_MINIMUM_PRICE;
  contractCall.methodName = methodName;
  contractCall.methodDesc = methodDesc;
  var contractConstructorArgsTypes = getContractMethodArgsTypes(contractAddress, methodName);
  contractCall.args = utils.twoDimensionalArray(args, contractConstructorArgsTypes);
  return contractCall;
}

/**
 * 调用合约
 */
async function callContract(pri, pub, fromAddress, assetsChainId, assetsId, contractCall) {
  var balanceInfo = await getNulsBalance(fromAddress);
  var newTimes = new _bignumber.BigNumber(contractCall.gasLimit);
  var amount = Number(newTimes.times(contractCall.price));
  //todo value转换为数字
  var value = contractCall.value;
  amount = amount + value;
  var transferInfo = {
    fromAddress: fromAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 100000
  };
  if (value > 0) {
    transferInfo.toAddress = contractCall.contractAddress;
    transferInfo.value = value;
  }

  var inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 16);
  var tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 16, contractCall);
  var txhex = void 0;
  //获取手续费
  var newFee = countFee(tAssemble, 1);
  //手续费大于0.001的时候重新组装交易及签名
  if (transferInfo.fee !== newFee) {
    transferInfo.fee = newFee;
    inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 16);
    tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 16, contractCall);
    txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  } else {
    txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  }

  var result = await validateTx(txhex);
  console.log(result);
  if (result.success) {
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

var contractCall = {
  chainId: 2,
  sender: fromAddress,
  contractAddress: "tNULSeBaN1NjSD1qF6Mj6z5XiGLSxaX8fQtg2G",
  value: 0, //
  gasLimit: 20000,
  price: 25,
  methodName: "approve",
  methodDesc: "",
  args: ['tNULSeBaNA1fArRNjbHrDi3ZTdQiM26harbwnD', 88]
};

//调用创建合约
callContract(pri, pub, fromAddress, 2, 1, contractCall);