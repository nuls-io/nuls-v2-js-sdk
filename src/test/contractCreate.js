const nuls = require('../index');
const utils = require('../utils/utils');
const sdk = require('../api/sdk');
const {getBalance, countFee, inputsOrOutputs, getContractConstructor, validateContractCreate, imputedContractCreateGas, validateTx, broadcastTx} = require('./api/util');
const BigNumber = require('bignumber.js');

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
  async createContract(pri, pub, createAddress, assetsChainId, assetsId, contractCreate, remark, prefix) {
    //1、通过接口获取合约的参数 args
    let hex = contractCreate.contractCode;
    const constructor = await getContractConstructor(hex);
    
    // 检查构造函数是否成功获取
    if (!constructor || !constructor.success || !constructor.data) {
      throw new Error('获取合约构造函数失败: ' + (constructor && constructor.error ? JSON.stringify(constructor.error) : '未知错误'));
    }
    
    console.log(constructor.data.constructor.args);
    //2、给每个参数复制 获取contractCreateTxData
    let newArgs = contractCreate.args;
    const contractCreateTxData = await this.makeCreateData(contractCreate.chainId, createAddress, contractCreate.alias, hex, newArgs, prefix);
    //3、序列化

    let chainId = contractCreate.chainId;
    const balanceInfo = await getBalance(chainId, assetsChainId, assetsId, createAddress);
    let amount = new BigNumber(contractCreateTxData.gasLimit).multipliedBy(contractCreateTxData.price);
    let transferInfo = {
      fromAddress: createAddress,
      assetsChainId: assetsChainId,
      assetsId: assetsId,
      amount: amount,
      fee: new BigNumber("0.005").shiftedBy(nuls.decimals())
    };

    let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 15);
    let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 15, contractCreateTxData);
    let txhex;
    //获取手续费
    let newFee = countFee(tAssemble, 1);
    //手续费大于0.001的时候重新组装交易及签名
    if (transferInfo.fee.isLessThan(newFee)) {
      transferInfo.fee = new BigNumber(newFee);
      inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 15);
      tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 15, contractCreateTxData);
    } 
    txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
    // console.log(txhex);
    //4、验证交易
    let result = await validateTx(txhex);
    if (result.success) {
      //5、广播交易
      let results = await broadcastTx(txhex);
      // console.log(results);
      if (results && results.value) {
        // console.log("交易完成, 合约地址: " + contractCreateTxData.contractAddress)
        results.contractAddress = contractCreateTxData.contractAddress;
        return {success: true, data: results};
      } else {
        // console.log("广播交易失败")
        return {success: false, data: results};
      }
    } else {
      // console.log("验证交易失败")
      return {success: false, data: result.error};
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
    let result = await validateContractCreate(sender, sdk.CONTRACT_MAX_GASLIMIT, new BigNumber(sdk.CONTRACT_MINIMUM_PRICE).shiftedBy(nuls.decimals() - 8).toFixed(), contractCode, args);
    if (result.success) {
      return await imputedContractCreateGas(sender, contractCode, args);
    } else {
      throw "创建合约验证失败:" + JSON.stringify(result);
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
  async makeCreateData(chainId, sender, alias, contractCode, args, prefix) {
    let contractCreate = {};
    contractCreate.chainId = chainId;
    contractCreate.sender = sender;
    contractCreate.alias = alias;
    contractCreate.gasLimit = await this.imputedCreateGas(sender, contractCode, args);
    contractCreate.price = new BigNumber(sdk.CONTRACT_MINIMUM_PRICE).shiftedBy(nuls.decimals() - 8).toFixed();
    contractCreate.contractCode = contractCode;

    let constructor = await getContractConstructor(contractCode);
    
    // 检查构造函数是否成功获取
    if (!constructor || !constructor.success || !constructor.data) {
      throw new Error('获取合约构造函数失败: ' + (constructor && constructor.error ? JSON.stringify(constructor.error) : '未知错误'));
    }
    
    let contractConstructorArgsTypes = await this.makeContractConstructorArgsTypes(constructor);
    contractCreate.args = await utils.twoDimensionalArray(args, contractConstructorArgsTypes);
    contractCreate.contractAddress = sdk.getStringContractAddress(chainId, prefix);
    return contractCreate;
  }

}