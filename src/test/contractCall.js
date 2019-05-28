const nuls = require('../index');
const utils = require('../utils/utils');
const sdk = require('../api/sdk');
const {getNulsBalance, countFee, inputsOrOutputs, getContractMethodArgsTypes, validateContractCall, imputedContractCallGas, validateTx, broadcastTx} = require('./api/util');
let pri = '411fa90f7161a20f4624a4f00167fac6d5afd97a7e6815f60e66106c559564a1';
let pub = '031c810153d633a5167ec629af771296bad4f26eacfe4034c978afee12b6c4fd44';
let fromAddress = "tNULSeBaMuBCG7NkSyufjE76CVbPQMrZ5Q1v3s";
let remark = 'call contract...';


/**
 * 预估调用合约的gas
 */
async function imputedCallGas(chainId, sender, value, contractAddress, methodName, methodDesc, args) {
  let result = await validateContractCall(chainId, sender, value, sdk.CONTRACT_MAX_GASLIMIT, sdk.CONTRACT_MINIMUM_PRICE, contractAddress, methodName, methodDesc, args);
  if (results && result.value) {
    return await imputedContractCallGas(chainId, sender, value, contractAddress, methodName, methodDesc, args);
  } else {
    //todo throw exception
    console.log("调用合约验证失败")
  }
}


/**
 * 组装创建合约交易的txData
 */
async function makeCallData(chainId, sender, value, contractAddress, methodName, methodDesc, args) {
  let contractCall = {};
  contractCall.chainId = chainId;
  contractCall.sender = sender;
  contractCall.contractAddress = contractAddress;
  contractCall.value = value;
  contractCall.gasLimit = imputedCallGas(chainId, sender, value, contractAddress, methodName, methodDesc, args);
  contractCall.price = sdk.CONTRACT_MINIMUM_PRICE;
  contractCall.methodName = methodName;
  contractCall.methodDesc = methodDesc;
  let contractConstructorArgsTypes = getContractMethodArgsTypes(chainId, contractAddress, methodName);
  let twoDimensionalArgs = utils.twoDimensionalArray(args, contractConstructorArgsTypes);
  contractCall.args = twoDimensionalArgs;
  return contractCall;
}

/**
 * 调用合约
 */
async function callContract(pri, pub, fromAddress, assetsChainId, assetsId, contractCall) {
  const balanceInfo = await getNulsBalance(fromAddress);
  let amount = contractCreate.gasLimit * contractCreate.price;
  //todo value转换为数字
  let value = contractCall.value;
  amount = amount + value;
  let transferInfo = {
    fromAddress: fromAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 100000
  };
  if(value.toNumber() > 0) {
    transferInfo.toAddress = contractCall.contractAddress;
    transferInfo.value = value;
  }

  let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 16);
  let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 16, contractCall);
  let txhex;
  //获取手续费
  let newFee = countFee(tAssemble, 1);
  //手续费大于0.001的时候重新组装交易及签名
  if (transferInfo.fee !== newFee) {
    transferInfo.fee = newFee;
    inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 16);
    tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 16, contractCall);
    txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  } else {
    txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  }

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

let contractCall = {
  chainId: 2,
  sender: "",
  contractAddress: "",
  value : 0,//
  gasLimit: 20000,
  price: 25,
  methodName: "",
  methodDesc: "",
  args: []
};

//调用创建合约
callContract(pri, pub, fromAddress, 2, 1, contractCall);
