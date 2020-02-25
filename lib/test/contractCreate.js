'use strict';

var nuls = require('../index');
var utils = require('../utils/utils');
var sdk = require('../api/sdk');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    countFee = _require.countFee,
    inputsOrOutputs = _require.inputsOrOutputs,
    getContractConstructor = _require.getContractConstructor,
    validateContractCreate = _require.validateContractCreate,
    imputedContractCreateGas = _require.imputedContractCreateGas,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx;

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
  createContract: async function createContract(pri, pub, createAddress, assetsChainId, assetsId, contractCreate, remark) {
    //1、通过接口获取合约的参数 args
    var hex = contractCreate.contractCode;
    var constructor = await getContractConstructor(hex);
    console.log(constructor.data.constructor.args);
    //2、给每个参数复制 获取contractCreateTxData
    var newArgs = contractCreate.args;
    var contractCreateTxData = await this.makeCreateData(contractCreate.chainId, createAddress, contractCreate.alias, hex, newArgs);
    //3、序列化

    var balanceInfo = await getNulsBalance(createAddress);
    var amount = contractCreateTxData.gasLimit * contractCreateTxData.price;
    var transferInfo = {
      fromAddress: createAddress,
      assetsChainId: assetsChainId,
      assetsId: assetsId,
      amount: amount,
      fee: 100000
    };

    var inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 15);
    var tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 15, contractCreateTxData);
    var txhex = void 0;
    //获取手续费
    var newFee = countFee(tAssemble, 1);
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
    var result = await validateTx(txhex);
    if (result) {
      //5、广播交易
      var results = await broadcastTx(txhex);
      console.log(results);
      if (results && results.value) {
        console.log("交易完成, 合约地址: " + contractCreateTxData.contractAddress);
      } else {
        console.log("广播交易失败");
      }
    } else {
      console.log("验证交易失败");
    }
  },


  /**
   * 组装构造函数的参数类型
   * @param constructor
   * @returns {Promise<any[]>}
   */
  makeContractConstructorArgsTypes: async function makeContractConstructorArgsTypes(constructor) {
    var args = constructor.data.constructor.args;
    var length = args.length;
    var contractConstructorArgsTypes = new Array(length);
    var arg = void 0;
    for (var i = 0; i < length; i++) {
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
  imputedCreateGas: async function imputedCreateGas(sender, contractCode, args) {
    var result = await validateContractCreate(sender, sdk.CONTRACT_MAX_GASLIMIT, sdk.CONTRACT_MINIMUM_PRICE, contractCode, args);
    if (result.success) {
      return await imputedContractCreateGas(sender, contractCode, args);
    } else {
      console.log("创建合约验证失败");
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
  makeCreateData: async function makeCreateData(chainId, sender, alias, contractCode, args) {
    var contractCreate = {};
    contractCreate.chainId = chainId;
    contractCreate.sender = sender;
    contractCreate.alias = alias;
    contractCreate.gasLimit = await this.imputedCreateGas(sender, contractCode, args);
    contractCreate.price = sdk.CONTRACT_MINIMUM_PRICE;
    contractCreate.contractCode = contractCode;

    var constructor = await getContractConstructor(contractCode);
    var contractConstructorArgsTypes = await this.makeContractConstructorArgsTypes(constructor);
    contractCreate.args = await utils.twoDimensionalArray(args, contractConstructorArgsTypes);
    contractCreate.contractAddress = sdk.getStringContractAddress(chainId);
    return contractCreate;
  }
};