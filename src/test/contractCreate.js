const nuls = require('../index');
const utils = require('../utils/utils');
const sdk = require('../api/sdk');
const {getNulsBalance, countFee, inputsOrOutputs, getContractConstructor, validateContractCreate, imputedContractCreateGas, validateTx, broadcastTx} = require('./api/util');

module.exports = {

  /**
   * 创建合约
   * @param pri
   * @param pub
   * @param createAddress
   * @param assetsChainId
   * @param assetsId
   * @returns {Promise<void>}
   */
  async createContract(pri, pub, createAddress, assetsChainId, assetsId, contractCreate, remark) {
    //1、通过接口获取合约的参数 args
    let hex = contractCreate.contractCode;
    const constructor = await getContractConstructor(hex);
    console.log(constructor.data.constructor.args);
    //2、给每个参数复制 获取contractCreateTxData
    let newArgs = contractCreate.args;
    const contractCreateTxData = await this.makeCreateData(contractCreate.chainId, createAddress, contractCreate.alias, hex, newArgs);
    //3、序列化

    const balanceInfo = await getNulsBalance(createAddress);
    let amount = contractCreateTxData.gasLimit * contractCreateTxData.price;
    let transferInfo = {
      fromAddress: createAddress,
      assetsChainId: assetsChainId,
      assetsId: assetsId,
      amount: amount,
      fee: 100000
    };

    let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 15);
    let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 15, contractCreateTxData);
    let txhex;
    //获取手续费
    let newFee = countFee(tAssemble, 1);
    //手续费大于0.001的时候重新组装交易及签名
    if (transferInfo.fee !== newFee) {
      transferInfo.fee = newFee;
      inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 15);
      tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 15, contractCreateTxData);
      txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
    } else {
      txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
    }
    console.log(txhex);
    //4、验证交易
    let result = await validateTx(txhex);
    if (result) {
      //5、广播交易
      let results = await broadcastTx(txhex);
      console.log(results);
      if (results && results.value) {
        console.log("交易完成, 合约地址: " + contractCreateTxData.contractAddress)
      } else {
        console.log("广播交易失败")
      }
    } else {
      console.log("验证交易失败")
    }
  },

  /**
   * 组装构造函数的参数类型
   * @param constructor
   * @returns {Promise<any[]>}
   */
  async makeContractConstructorArgsTypes(constructor) {
    let args = constructor.data.constructor.args;
    let length = args.length;
    let contractConstructorArgsTypes = new Array(length);
    let arg;
    for (let i = 0; i < length; i++) {
      arg = args[i];
      contractConstructorArgsTypes[i] = arg.type;
    }
    return contractConstructorArgsTypes;
  },

  /**
   * 预估创建合约的gas
   * @param sender
   * @param contractCode
   * @param args
   * @returns {Promise<*>}
   */
  async imputedCreateGas(sender, contractCode, args) {
    let result = await validateContractCreate(sender, sdk.CONTRACT_MAX_GASLIMIT, sdk.CONTRACT_MINIMUM_PRICE, contractCode, args);
    if (result.success) {
      return await imputedContractCreateGas(sender, contractCode, args);
    } else {
      console.log("创建合约验证失败")
    }
  },

  /**
   * 组装创建合约交易的txData
   * @param chainId
   * @param sender
   * @param contractCode
   * @param args
   * @param alias
   * @returns {Promise<{}>}
   */
  async makeCreateData(chainId, sender, alias, contractCode, args) {
    let contractCreate = {};
    contractCreate.chainId = chainId;
    contractCreate.sender = sender;
    contractCreate.alias = alias;
    contractCreate.gasLimit = await this.imputedCreateGas(sender, contractCode, args);
    contractCreate.price = sdk.CONTRACT_MINIMUM_PRICE;
    contractCreate.contractCode = contractCode;

    let constructor = await getContractConstructor(contractCode);
    let contractConstructorArgsTypes = await this.makeContractConstructorArgsTypes(constructor);
    contractCreate.args = await utils.twoDimensionalArray(args, contractConstructorArgsTypes);
    contractCreate.contractAddress = sdk.getStringContractAddress(chainId);
    return contractCreate;
  }

}