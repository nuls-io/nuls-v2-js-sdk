const nuls = require('../index');
const utils = require('../utils/utils');
const sdk = require('../api/sdk');
const {getNulsBalance, countFee, inputsOrOutputs, validateContractDelete, validateTx, broadcastTx} = require('./api/util');
let pri = '411fa90f7161a20f4624a4f00167fac6d5afd97a7e6815f60e66106c559564a1';
let pub = '031c810153d633a5167ec629af771296bad4f26eacfe4034c978afee12b6c4fd44';
let fromAddress = "tNULSeBaMuBCG7NkSyufjE76CVbPQMrZ5Q1v3s";
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
    console.log("验证删除合约失败")
    return;
  }

  let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 17);
  let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 17, contractDelete);
  let txhex = await nuls.transactionSerialize(pri, pub, tAssemble);

  let result = await validateTx(txhex);
  if (result) {
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

let contractDelete = {
  chainId: 2,
  sender: "",
  contractAddress: ""
};

//调用创建合约
deleteContract(pri, pub, fromAddress, 2, 1, contractDelete);
