const nuls = require('../index');
const utils = require('../utils/utils');
const sdk = require('../api/sdk');
const {getNulsBalance, countFee, inputsOrOutputs, validateContractDelete, validateTx, broadcastTx} = require('./api/util');
let pri = '76b7beaa98db863fb680def099af872978209ed9422b7acab8ab57ad95ab218b';
let pub = '02ec9e957823cd30d809f44830442562ca5bf42530251247b35d9209690f39be67';
let fromAddress = "tNULSeBaMqywZjfSrKNQKBfuQtVxAHBQ8rB2Zn";
let remark = 'delete contract...';

/**
 * 组装创建合约交易的txData
 */
async function makeDeleteData(chainId, sender, contractAddress) {
  let contractDelete = {};
  contractDelete.chainId = chainId;
  contractDelete.sender = sender;
  contractDelete.contractAddress = contractAddress;
  return contractDelete;
}

/**
 * 调用合约
 */
async function deleteContract(pri, pub, fromAddress, assetsChainId, assetsId, contractDelete) {
  const balanceInfo = await getNulsBalance(fromAddress);
  let amount = 0;
  let transferInfo = {
    fromAddress: fromAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 100000
  };

  let deleteValidateResult = await validateContractDelete(assetsChainId, contractDelete.sender, contractDelete.contractAddress);
  if (!deleteValidateResult) {
    //todo throw exception
    console.log("验证删除合约失败");
    return;
  }
  let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 17);
  let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 17, contractDelete);
  let txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  let result = await validateTx(txhex);
  console.log(result);
  if (result) {
    let results = await broadcastTx(txhex);
    if (results && results.value) {
      console.log("交易完成")
    } else {
      console.log("广播交易失败")
    }
  } else {
    console.log("验证交易失败")
  }
}

let contractDelete = {
  chainId: 2,
  sender: fromAddress,
  contractAddress: "tNULSeBaNA1fArRNjbHrDi3ZTdQiM26harbwnD"
};

//调用创建合约
deleteContract(pri, pub, fromAddress, 2, 1, contractDelete);
