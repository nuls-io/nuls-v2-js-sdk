'use strict';

var nuls = require('../index');
var sdk = require('../api/sdk');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    countFee = _require.countFee,
    inputsOrOutputs = _require.inputsOrOutputs,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx;

/**
 * @disc: 设置别名 dome
 * @params:
 * @date: 2019-10-18 10:38
 * @author: Wave
 */

var pri = '4100e2f88c3dba08e5000ed3e8da1ae4f1e0041b856c09d35a26fb399550f530';
var pub = '020e19418ed26700b0dba720dcc95483cb4adb1b5f8a103818dab17d5b05231854';
var fromAddress = "tNULSeBaMu38g1vnJsSZUCwTDU9GsE5TVNUtpD";
//黑洞地址
var toAddress = 'tNULSeBaMhZnRteniCy3UZqPjTbnWKBPHX1a5d';
var amount = 100000000;
var remark = 'set alias....';

//调用设置别名
setAlias(pri, pub, fromAddress, toAddress, 2, 1, amount, remark);

/**
 * 设置别名
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
async function setAlias(pri, pub, fromAddress, toAddress, assetsChainId, assetsId, amount, remark) {
  var balanceInfo = await getNulsBalance(fromAddress);
  var transferInfo = {
    fromAddress: fromAddress,
    toAddress: toAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 100000
  };
  var inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 3);
  var aliasInfo = {
    fromAddress: fromAddress,
    alias: 'wave'
  };
  //交易组装
  var tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 3, aliasInfo);
  console.log(tAssemble);
  //获取hash
  var hash = await tAssemble.getHash();
  console.log(hash);
  //交易签名
  var txSignature = await sdk.getSignData(hash.toString('hex'), pri);
  console.log(txSignature);
  //通过拼接签名、公钥获取HEX
  var signData = await sdk.appSplicingPub(txSignature.signValue, pub);
  tAssemble.signatures = signData;
  var txhex = tAssemble.txSerialize().toString("hex");
  console.log(txhex.toString('hex'));

  /*let getHex = await  sdk.appSplicingPub(txSignature);
  console.log(getHex);
    let txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  console.log(txhex);*/
  var result = await validateTx(txhex.toString('hex'));
  console.log(result);
  if (result) {
    console.log(result.data.value);
    var results = await broadcastTx(txhex);
    if (results && result.data.value) {
      console.log("交易完成");
    } else {
      console.log("广播交易失败");
    }
  } else {
    console.log("验证交易失败");
  }
}