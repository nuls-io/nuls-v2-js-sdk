'use strict';

var nuls = require('../index');
var utils = require('../utils/utils');
var sdk = require('../api/sdk');
var BigNumber = require('bignumber.js');

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
 * @param chainId
 * @param sender
 * @param value
 * @param contractAddress
 * @param methodName
 * @param methodDesc
 * @param args
 * @returns {Promise<*>}
 */
async function imputedCallGas(chainId, sender, value, contractAddress, methodName, methodDesc, args) {
  var result = await validateContractCall(sender, value, sdk.CONTRACT_MAX_GASLIMIT, sdk.CONTRACT_MINIMUM_PRICE, contractAddress, methodName, methodDesc, args);
  if (result.success) {
    var gasResult = await imputedContractCallGas(sender, value, contractAddress, methodName, methodDesc, args);
    return Number(gasResult.data.gasLimit);
  } else {
    console.log("调用合约验证失败\n", result);
  }
}

/**
 * 组装创建合约交易的txData
 * @param chainId
 * @param sender
 * @param value
 * @param contractAddress
 * @param methodName
 * @param methodDesc
 * @param args
 * @returns {Promise<{}>}
 */
async function makeCallData(chainId, sender, value, contractAddress, methodName, methodDesc, args) {
  var contractCall = {};
  contractCall.chainId = chainId;
  contractCall.sender = sender;
  contractCall.contractAddress = contractAddress;
  contractCall.value = value;
  contractCall.gasLimit = await imputedCallGas(chainId, sender, value, contractAddress, methodName, methodDesc, args);
  contractCall.price = sdk.CONTRACT_MINIMUM_PRICE;
  contractCall.methodName = methodName;
  contractCall.methodDesc = methodDesc;
  var argsTypesResult = await getContractMethodArgsTypes(contractAddress, methodName);
  var contractConstructorArgsTypes = void 0;
  if (argsTypesResult.success) {
    contractConstructorArgsTypes = argsTypesResult.data;
  } else {
    console.log("获取参数数组失败\n", argsTypesResult.data);
    throw "query data failed";
  }
  contractCall.args = utils.twoDimensionalArray(args, contractConstructorArgsTypes);
  return contractCall;
}

/**
 * 调用合约
 * @param pri
 * @param pub
 * @param fromAddress
 * @param assetsChainId
 * @param assetsId
 * @param contractCall
 * @returns {Promise<void>}
 */
async function callContract(pri, pub, fromAddress, assetsChainId, assetsId, contractCall) {
  var balanceInfo = await getNulsBalance(fromAddress);
  var contractAddress = contractCall.contractAddress;
  var newTimes = new BigNumber(contractCall.gasLimit);
  var amount = Number(newTimes.times(contractCall.price));
  var value = Number(contractCall.value);
  var newValue = new BigNumber(contractCall.value);
  amount = Number(newValue.plus(amount));
  var contractCallTxData = await makeCallData(2, fromAddress, value, contractAddress, contractCall.methodName, contractCall.methodDesc, contractCall.args);
  var transferInfo = {
    fromAddress: fromAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 100000
  };
  if (value > 0) {
    transferInfo.toAddress = contractAddress;
    transferInfo.amount = value + amount;
  }

  var inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 16);
  var tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 16, contractCallTxData);
  var txhex = void 0;
  //获取手续费
  var newFee = countFee(tAssemble, 1);
  //手续费大于0.001的时候重新组装交易及签名
  if (transferInfo.fee !== newFee) {
    transferInfo.fee = newFee;
    inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 16);
    tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 16, contractCallTxData);
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
      console.log("广播交易失败\n", results);
    }
  } else {
    console.log("验证交易失败");
  }
}

var contractCall = {
  chainId: 2,
  sender: fromAddress,
  contractAddress: "tNULSeBaMz6WgGAQgyhGyMwdUDs879f6SAu3vT",
  value: 0, //
  gasLimit: 20000,
  price: 25,
  methodName: "approve",
  methodDesc: "",
  args: ["tNULSeBaNA1fArRNjbHrDi3ZTdQiM26harbwnD", 88]
};

//调用创建合约
callContract(pri, pub, fromAddress, 2, 1, contractCall);