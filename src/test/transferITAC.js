const nuls = require('../index');
const {getNulsBalance, countFee, inputsOrOutputs, validateTx, broadcastTx} = require('./api/util');

nuls.customnet(101, "https://api.itac.club/jsonrpc");
const BigNumber = require("bignumber.js");
require('dotenv').config();

/**
 * @disc: 转账 dome
 * @date: 2020-05-20 13:47
 * @author: Wave
 */
let pri = process.env.rich;
let pub = nuls.getPubByPri(pri);
let fromAddress = nuls.getAddressByPri(nuls.chainId(), pri, "ITAC");
console.log('fromAddress', fromAddress);

let toAddress = 'ITACdAD3FnMJMmi2LtYTzVWDQ1DXj7LFGdoT4v';
let amount = new BigNumber("0.5").shiftedBy(18).toFixed();
let remark = 'transfer transaction remark...';
//调用
transferTransaction(pri, pub, fromAddress, toAddress, nuls.chainId(), 1, amount, remark);

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
async function transferTransaction(pri, pub, fromAddress, toAddress, assetsChainId, assetsId, amount, remark, needPersonalSign) {
  const balanceInfo = await getNulsBalance(fromAddress, nuls.chainId(), 1);
  // console.log(balanceInfo);
  if (!balanceInfo.success) {
    console.log("获取账户balanceInfo错误");
    return;
  }

  let transferInfo = {
    fromAddress: fromAddress,
    toAddress: toAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: new BigNumber("0.001").shiftedBy(nuls.decimals()).toFixed()
  };

  let newAmount = transferInfo.amount + transferInfo.fee;
  if (balanceInfo.data.balance < newAmount) {
    console.log("余额不足，请更换账户");
    return;
  }

  let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo.data, 2);
  if (!inOrOutputs.success) {
    console.log("inputOutputs组装失败!");
    return;
  }

  let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 2);//交易组装
  let txhex = "";//交易签名
  let newFee = countFee(tAssemble, 1);  //获取手续费
  //手续费大于0.001的时候重新组装交易及签名
  if (transferInfo.fee < newFee) {
    transferInfo.fee = newFee;
    inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo.data, 2);
    tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 2);
  } 
  txhex = await nerve.transactionSerialize(pri, pub, tAssemble);
  // console.log(txhex);

  let result = await validateTx(txhex);
  if (result.success) {
    // console.log(result.data.value);
    let results = await broadcastTx(txhex);
    console.log(results);
    if (results && results.value) {
      // console.log("交易完成")
      return {success: true, data: results};
    } else {
      // console.log("广播交易失败")
      return {success: false, data: results};
    }
  } else {
    // console.log("验证交易失败:" + JSON.stringify(result.error))
    return {success: false, data: result.error};
  }
}



