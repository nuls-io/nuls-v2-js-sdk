const nuls = require('../index');
const {getNulsBalance, countFee, inputsOrOutputs, validateTx, broadcastTx, agentDeposistList} = require('./api/util');
let pri = '94d344417d6faa55e3017709dd6b837bac2bc1769e3a4b516ac9a981465ac03c';
let pub = '02403cb49ac24ff9555b073ce981e28bed5e81438b2c715a14d06bd248ea1d0091';
let fromAddress = "tNULSeBaMfwpGBmn8xuKABPWUbdtsM2cMoinnn";
let amount = 2000100000000;
let remark = 'stop agent....';

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
  const balanceInfo = await getNulsBalance(fromAddress);
  let transferInfo = {
    fromAddress: fromAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: countFee(),
    depositHash: agentHash,
  };
  let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 9);
  let newInputs = inOrOutputs.inputs;
  let newOutputs = inOrOutputs.outputs;
  const depositList = await agentDeposistList(agentHash);
  for (let itme of depositList.list) {
    newInputs.push({
      address: itme.address,
      assetsChainId: assetsChainId,
      assetsId: assetsId,
      amount: itme.amount,
      locked: -1,
      nonce: itme.txHash.substring(agentHash.length - 16)//这里是hash的最后16个字符
    });
    newOutputs.push({
      address: itme.address, assetsChainId: assetsChainId,
      assetsId: assetsId, amount: itme.amount, lockTime: 0
    });
  }
  let txhex = await nuls.transactionSerialize(pri, pub, newInputs, newOutputs, remark, 9, agentHash);
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

//调用注销节点
stopAgent(pri, pub, fromAddress, 2, 1, amount, 'a06f504e093f1fdc49fde86d04ddb0645b5fa5ee059e2eae5e2d4e93b9d6aaee');
