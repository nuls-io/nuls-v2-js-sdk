const nuls = require('../index');
const {getNulsBalance, countFee, inputsOrOutputs, validateTx, broadcastTx, agentDeposistList} = require('./api/util');
let pri = '411fa90f7161a20f4624a4f00167fac6d5afd97a7e6815f60e66106c559564a1';
let pub = '031c810153d633a5167ec629af771296bad4f26eacfe4034c978afee12b6c4fd44';
let fromAddress = "tNULSeBaMuBCG7NkSyufjE76CVbPQMrZ5Q1v3s";
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
stopAgent(pri, pub, fromAddress, 2, 1, amount, '1c641f4b6ec42155e6c3e17b4f78db96353776c294a75c1dcca1f77f3f753545');
