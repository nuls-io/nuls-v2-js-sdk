const nuls = require('../index');
const {getNulsBalance, countFee, inputsOrOutputs, validateTx, broadcastTx, agentDeposistList} = require('./api/util');

/**
 * @disc: 注销节点 dome
 * @date: 2019-10-18 10:38
 * @author: Wave
 */

let pri = '777e333556edb17564ea45f84dce0f5fbea884123924575213c7a30cb3c9375410';
let pub = '027d8d404b0aaa834491999a0212ef7e432da69c6462857566f80a2c81e259e7b2';
let fromAddress = "NULSd6HgfzPGhFsZX16hHgneY25YKs6v6LvmX";
let amount = 2000000000000;
let remark = 'stop agent....';

//调用注销节点
stopAgent(pri, pub, fromAddress, 1, 1, amount, '7018c41307132d3e4709c3f50bae235e6f028a267b291930520bdb25f9d24195');

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
  //console.log(balanceInfo);
  let transferInfo = {
    fromAddress: fromAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 100000,
    depositHash: agentHash,
  };
  let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 9);
  //console.log(inOrOutputs);
  let newInputs = inOrOutputs.data.inputs;
  //console.log(newInputs);
  let newOutputs = [];
  //console.log(newOutputs);
  const depositList = await agentDeposistList(agentHash);
  //console.log(depositList);
  //console.log(depositList);
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
  let addressArr = [];
  let newOutputss = [];
  newOutputs.forEach(function (item) {
    let i;
    if ((i = addressArr.indexOf(item.address)) > -1) {
      //console.log(result, i);
      newOutputss[i].amount = Number(newOutputss[i].amount) + Number(item.amount);
    } else {
      addressArr.push(item.address);
      newOutputss.push({
        address: item.address,
        amount: item.amount,
        assetsChainId: item.assetsChainId,
        assetsId: item.assetsId,
        lockTime: item.lockTime,
      })
    }
  });
  newOutputss.unshift(inOrOutputs.data.outputs[0]);

  //console.log(newInputs);
  //console.log(newOutputss);

  let tAssemble = await nuls.transactionAssemble(newInputs, newOutputss, remark, 9, agentHash);
  //console.log(tAssemble);
  let txhex = '';
  //获取手续费
  let newFee = countFee(tAssemble, 1);
  //手续费大于0.001的时候重新组装交易及签名
  if (transferInfo.fee !== newFee) {
    transferInfo.fee = newFee;
    inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 9);
    newInputs = inOrOutputs.data.inputs;
    newOutputs = inOrOutputs.data.outputs;
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
    tAssemble = await nuls.transactionAssemble(newInputs, newOutputs, remark, 9, agentHash);
    txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  } else {
    txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  }
  //console.log(txhex);
  let result = await validateTx(txhex);
  //console.log(result);
  if (result) {
    let results = await broadcastTx(txhex);
    //console.log(results);
    if (results && result.value) {
      console.log("交易完成")
    } else {
      console.log("广播交易失败")
    }
  } else {
    console.log("验证交易失败")
  }
}


