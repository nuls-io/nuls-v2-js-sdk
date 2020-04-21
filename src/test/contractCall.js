const nuls = require('../index');
const utils = require('../utils/utils');
const sdk = require('../api/sdk');
const BigNumber = require('bignumber.js');
const {getNulsBalance, countFee, inputsOrOutputs, getContractMethodArgsTypes, validateContractCall, imputedContractCallGas, validateTx, broadcastTx} = require('./api/util');

module.exports = {
  /**
   * 调用合约
   * @param pri
   * @param pub
   * @param fromAddress
   * @param assetsChainId
   * @param assetsId
   * @param contractCall
   * @returns {Promise<void>}
   */
  async callContract(pri, pub, fromAddress, assetsChainId, assetsId, contractCall, remark) {
    const balanceInfo = await getNulsBalance(fromAddress);
    let contractAddress = contractCall.contractAddress;
    let value = Number(contractCall.value);
    let newValue = new BigNumber(contractCall.value);
    const contractCallTxData = await this.makeCallData(contractCall.chainId, fromAddress, value, contractAddress, contractCall.methodName, contractCall.methodDesc, contractCall.args);
    let gasLimit = new BigNumber(contractCallTxData.gasLimit);
    let gasFee = Number(gasLimit.times(contractCallTxData.price));
    let amount = Number(newValue.plus(gasFee));
    let transferInfo = {
      fromAddress: fromAddress,
      assetsChainId: assetsChainId,
      assetsId: assetsId,
      amount: amount,
      fee: 100000
    };
    if (value > 0) {
      transferInfo.toAddress = contractAddress;
      transferInfo.value = contractCall.value;
    }

    let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 16);
    let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 16, contractCallTxData);
    let txhex;
    //获取手续费
    let newFee = countFee(tAssemble, 1);
    //手续费大于0.001的时候重新组装交易及签名
    if (transferInfo.fee !== newFee) {
      transferInfo.fee = newFee;
      inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 16);
      tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 16, contractCallTxData);
      txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
    } else {
      txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
    }
    console.log(txhex);
    let result = await validateTx(txhex);
    console.log(result);
    if (result.success) {
      let results = await broadcastTx(txhex);
      if (results && results.value) {
        console.log("交易完成")
      } else {
        console.log("广播交易失败\n", results)
      }
    } else {
      console.log("验证交易失败")
    }
  },

  /**
   * 预估调用合约的gas
   * @param chainId
   * @param sender
   * @param value
   * @param contractAddress
   * @param methodName
   * @param methodDesc
   * @param args
   * @returns {Promise<*>}
   */
  async imputedCallGas(chainId, sender, value, contractAddress, methodName, methodDesc, args) {
    let result = await validateContractCall(sender, value, sdk.CONTRACT_MAX_GASLIMIT, sdk.CONTRACT_MINIMUM_PRICE, contractAddress, methodName, methodDesc, args);
    if (result.success) {
      let gasResult = await imputedContractCallGas(sender, value, contractAddress, methodName, methodDesc, args);
      return Number(gasResult.data.gasLimit);
    } else {
      console.log("调用合约验证失败\n", result)
    }
  },

  /**
   * 组装创建合约交易的txData
   * @param chainId
   * @param sender
   * @param value
   * @param contractAddress
   * @param methodName
   * @param methodDesc
   * @param args
   * @returns {Promise<{}>}
   */
  async makeCallData(chainId, sender, value, contractAddress, methodName, methodDesc, args) {
    let contractCall = {};
    contractCall.chainId = chainId;
    contractCall.sender = sender;
    contractCall.contractAddress = contractAddress;
    contractCall.value = value;
    contractCall.gasLimit = await this.imputedCallGas(chainId, sender, value, contractAddress, methodName, methodDesc, args);
    contractCall.price = sdk.CONTRACT_MINIMUM_PRICE;
    contractCall.methodName = methodName;
    contractCall.methodDesc = methodDesc;
    let argsTypesResult = await getContractMethodArgsTypes(contractAddress, methodName, methodDesc);
    let contractConstructorArgsTypes;
    if (argsTypesResult.success) {
      contractConstructorArgsTypes = argsTypesResult.data;
    } else {
      console.log("获取参数数组失败\n", argsTypesResult.data);
      throw "query data failed";
    }
    contractCall.args = utils.twoDimensionalArray(args, contractConstructorArgsTypes);
    return contractCall;
  }

}
