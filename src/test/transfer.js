const nuls = require('../index');
const {getNulsBalance, countFee, inputsOrOutputs, validateTx, broadcastTx} = require('./api/util');

/**
 * @disc: 转账 dome
 * @date: 2019-10-18 10:40
 * @author: Wave
 */

let pri = 'x';
let pub = '03958b790c331954ed367d37bac901de5c2f06ac8368b37d7bd6cd5ae143c1d7e3';
let fromAddress = "tNULSeBaMvEtDfvZuukDf2mVyfGo3DdiN8KLRG";
let toAddress = 'tNULSeBaMsvfuGcosTR5dedtk8ksdfarrQWz3X';
let amount = 10000000;
let remark = 'coin test';
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
  const balanceInfo = await getNulsBalance(fromAddress);

  let transferInfo = {
    fromAddress: fromAddress,
    toAddress: toAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 100000
  };
  let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 2);
  let tAssemble = [];//交易组装
  let txhex = "";//交易签名
  if (inOrOutputs.success) {
    tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 2);
    //获取手续费
    let newFee = countFee(tAssemble, 1);
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
    console.log(inOrOutputs.data)
  }
  console.log(txhex);
  let result = await validateTx(txhex);
  if (result.success) {
    console.log(result.data.value);
    let results = await broadcastTx(txhex);
    if (results && results.value) {
      console.log("交易完成")
    } else {
      console.log("广播交易失败")
    }
  } else {
    console.log("验证交易失败:" + result.error)
  }
}



