const nuls = require('../index');
const {getNulsBalance, countFee, inputsOrOutputs, validateTx, broadcastTx} = require('./api/util');

let pri = '94d344417d6faa55e3017709dd6b837bac2bc1769e3a4b516ac9a981465ac03c';
let pub = '02403cb49ac24ff9555b073ce981e28bed5e81438b2c715a14d06bd248ea1d0091';
let fromAddress = "tNULSeBaMfwpGBmn8xuKABPWUbdtsM2cMoinnn";

//黑洞地址
let toAddress = 'tNULSeBaMkqeHbTxwKqyquFcbewVTUDHPkF11o';
let amount = 100000000;
let remark = 'niels test alias....';

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
  const balanceInfo = await getNulsBalance(fromAddress);
  let transferInfo = {
    fromAddress: fromAddress,
    toAddress: toAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: countFee()
  };
  let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 3);
  let aliasInfo = {
    fromAddress:fromAddress,
    alias:'wave'
  };
  let txhex = await nuls.transactionSerialize(pri, pub, inOrOutputs.inputs, inOrOutputs.outputs, remark, 3,aliasInfo);
  //console.log(txhex);
  let result = await validateTx(txhex);
  if (result) {
    console.log(result.value);
    let results = await broadcastTx(txhex);
    if (results && result.value) {
      console.log("交易完成")
    } else {
      console.log("广播交易失败")
    }
  } else {
    console.log("验证交易失败")
  }
}

//调用设置别名
setAlias(pri, pub, fromAddress, toAddress, 2, 1, amount, remark);
