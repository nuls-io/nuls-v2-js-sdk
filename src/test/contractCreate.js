const nuls = require('../index');
const utils = require('../utils/utils');
const sdk = require('../api/sdk');
const {getNulsBalance, countFee, inputsOrOutputs, getContractConstructor, validateContractCreate, imputedContractCreateGas, validateTx, broadcastTx} = require('./api/util');
let pri = '411fa90f7161a20f4624a4f00167fac6d5afd97a7e6815f60e66106c559564a1';
let pub = '031c810153d633a5167ec629af771296bad4f26eacfe4034c978afee12b6c4fd44';
let fromAddress = "tNULSeBaMuBCG7NkSyufjE76CVbPQMrZ5Q1v3s";
let remark = 'new contract...';

/**
 * 组装构造函数的参数类型
 * @param constructor 调用 getContractConstructor(chainId, contractCodeHex)
 */
async function makeContractConstructorArgsTypes(constructor) {
  let args = constructor.args;
  let length = args.length;
  let contractConstructorArgsTypes = new Array(length);
  let arg;
  for(let i = 0; i < length; i++) {
    arg = args[i];
    contractConstructorArgsTypes[i] = arg.type;
  }
  return contractConstructorArgsTypes;
}


/**
 * 预估创建合约的gas
 */
async function imputedCreateGas(chainId, sender, contractCode, args) {
  let result = await validateContractCreate(chainId, sender, sdk.CONTRACT_MAX_GASLIMIT, sdk.CONTRACT_MINIMUM_PRICE, contractCode, args);
  if (results && result.value) {
    return await imputedContractCreateGas(chainId, sender, contractCode, args);
  } else {
    //todo throw exception
    console.log("创建合约验证失败")
  }
}


/**
 * 组装创建合约交易的txData
 */
async function makeCreateData(chainId, sender, contractCode, args) {
  let contractCreate = {};
  contractCreate.chainId = chainId;
  contractCreate.sender = sender;
  contractCreate.gasLimit = imputedCreateGas(chainId, sender, contractCode, args);
  contractCreate.price = sdk.CONTRACT_MINIMUM_PRICE;
  contractCreate.contractCode = contractCode;

  let constructor = getContractConstructor(chainId, contractCode);
  let contractConstructorArgsTypes = makeContractConstructorArgsTypes(constructor);
  let twoDimensionalArgs = utils.twoDimensionalArray(args, contractConstructorArgsTypes);
  contractCreate.args = twoDimensionalArgs;

  contractCreate.contractAddress = sdk.getStringContractAddress(chainId);
  return contractCreate;
}

/**
 * 创建合约
 */
async function createContract(pri, pub, fromAddress, assetsChainId, assetsId, contractCreate) {
  const balanceInfo = await getNulsBalance(fromAddress);
  let amount = contractCreate.gasLimit * contractCreate.price;
  let transferInfo = {
    fromAddress: fromAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 100000
  };

  let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 15);
  let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 15, contractCreate);
  let txhex;
  //获取手续费
  let newFee = countFee(tAssemble, 1);
  //手续费大于0.001的时候重新组装交易及签名
  if (transferInfo.fee !== newFee) {
    transferInfo.fee = newFee;
    inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 15);
    tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 15, contractCreate);
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

let contractCreate = {
  chainId: 2,
  sender: "",
  contractAddress: "",
  gasLimit: 20000,
  price: 25,
  contractCode: "",
  args: []
};

//调用创建合约
createContract(pri, pub, fromAddress, 2, 1, contractCreate);
