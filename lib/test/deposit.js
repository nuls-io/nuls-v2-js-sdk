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
var amount = 210000000000;
var remark = 'deposit ....';

//转账功能 trustUrl
async function doit(pri, pub, fromAddress, assetsChainId, assetsId, amount, deposit) {
  var balanceInfo = await getNulsBalance(fromAddress);
  var transferInfo = {
    fromAddress: fromAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 100000
  };
  var inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 5);
  var tAssemble = await nuls.transactionAssemble(nOrOutputs.inputs, inOrOutputs.outputs, remark, 5, deposit);
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

//测试开始
var deposit = {
  address: fromAddress,
  agentHash: 'a8c9b4a5d9b33a79a6bc3a6f78caa2289ff22100de12e31b0009a937814f4899',
  deposit: 210000000000
};
//调用加入共识
doit(pri, pub, fromAddress, 2, 1, amount, deposit);