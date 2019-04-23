const nuls = require('../index');
const {getNulsBalance, countFee, inputsOrOutputs, validateTx, broadcastTx} = require('./api/util');
let pri = '411fa90f7161a20f4624a4f00167fac6d5afd97a7e6815f60e66106c559564a1';
let pub = '031c810153d633a5167ec629af771296bad4f26eacfe4034c978afee12b6c4fd44';
let fromAddress = "tNULSeBaMuBCG7NkSyufjE76CVbPQMrZ5Q1v3s";
let toAddress = 'tNULSeBaMp4u8yfeVPSWx1fZoVtfateY1ksNNN';
let amount = 110000000;
let remark = 'transfer test....';

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
    fee: countFee()
  };
  let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 2);
  let txhex = "";
  if (inOrOutputs.success) {
    txhex = await nuls.transactionSerialize(pri, pub, inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 2);
  } else {
    console.log(inOrOutputs.data)
  }
  //console.log(txhex);
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

//调用
transferTransaction(pri, pub, fromAddress, toAddress, 2, 1, amount, remark);

