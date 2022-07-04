const nuls = require('../index');
const utils = require('../utils/utils');
const sdk = require('../api/sdk');
const BigNumber = require('bignumber.js');
const {getBalance, countFee, inputsOrOutputsOfContractCall, getContractMethodArgsTypes, validateContractCall, imputedContractCallGas, validateTx, broadcastTx} = require('./api/util');

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
  async callContract(pri, pub, fromAddress, assetsChainId, assetsId, contractCall, remark, multyAssets, nulsValueToOthers, payAccount) {
    let chainId = contractCall.chainId;
    const balanceInfo = await getBalance(chainId, assetsChainId, assetsId, fromAddress);
    let contractAddress = contractCall.contractAddress;
    let value = Number(contractCall.value);
    let newValue = new BigNumber(contractCall.value);
    const contractCallTxData = await this.makeCallData(chainId, fromAddress, value, contractAddress, contractCall.methodName, contractCall.methodDesc, contractCall.args, multyAssets);
    let gasLimit = new BigNumber(contractCallTxData.gasLimit);
    let gasFee = Number(gasLimit.times(contractCallTxData.price));
    let amount = Number(newValue.plus(gasFee));
    let transferInfo = {
      fromAddress: fromAddress,
      assetsChainId: assetsChainId,
      assetsId: assetsId,
      amount: amount,
      fee: 200000
    };
    if (value > 0) {
      transferInfo.toAddress = contractAddress;
      transferInfo.value = contractCall.value;
    }
    // let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 16);
    if (multyAssets) {
      let length = multyAssets.length;
      for (var i = 0; i < length; i++) {
        let multyAsset = multyAssets[i];
        let _balanceInfo = await getBalance(chainId, multyAsset.assetChainId, multyAsset.assetId, fromAddress);
        if (_balanceInfo.balance < Number(multyAsset.value)) {
          throw "Your balance of " + multyAsset.assetChainId + "-" + multyAsset.assetId + " is not enough.";
        }
        multyAssets[i].nonce = _balanceInfo.nonce;
      }
    }

    let inOrOutputs = await inputsOrOutputsOfContractCall(transferInfo, balanceInfo, contractCall, multyAssets, nulsValueToOthers);
    if (payAccount) {
      const balanceInfoOfPayAccount = await getBalance(chainId, assetsChainId, assetsId, payAccount);
      let inputs = inOrOutputs.data.inputs;
      let from = inputs[inputs.length - 1];
      inputs.push({
        address: from.address,
        assetsChainId: from.assetsChainId,
        assetsId: from.assetsId,
        amount: '0',
        locked: 0,
        nonce: from.nonce
      });
      from.address = payAccount;
      from.nonce = balanceInfoOfPayAccount.nonce;
    }
    let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 16, contractCallTxData);
    let txhex = await nuls.transactionSerialize(pri, pub, tAssemble);

    console.log(txhex);
    if (payAccount) {
      console.log("请追加账户["+payAccount+"]的签名");
      return;
    }
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
  async imputedCallGas(chainId, sender, value, contractAddress, methodName, methodDesc, args, multyAssets) {
    let multyAssetArray;
    if (multyAssets) {
        let length = multyAssets.length;
        multyAssetArray = new Array(length);
        for (var i = 0; i < length; i++) {
            let multyAsset = multyAssets[i];
            multyAssetArray[i] = [multyAsset.value, multyAsset.assetChainId, multyAsset.assetId];
        }
    }
    let result = await validateContractCall(sender, value, sdk.CONTRACT_MAX_GASLIMIT, sdk.CONTRACT_MINIMUM_PRICE, contractAddress, methodName, methodDesc, args, multyAssetArray);
    if (result.success) {
      let gasResult = await imputedContractCallGas(sender, value, contractAddress, methodName, methodDesc, args, multyAssetArray);
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
  async makeCallData(chainId, sender, value, contractAddress, methodName, methodDesc, args, multyAssets) {
    let contractCall = {};
    contractCall.chainId = chainId;
    contractCall.sender = sender;
    contractCall.contractAddress = contractAddress;
    contractCall.value = value;
    contractCall.gasLimit = await this.imputedCallGas(chainId, sender, value, contractAddress, methodName, methodDesc, args, multyAssets);
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
