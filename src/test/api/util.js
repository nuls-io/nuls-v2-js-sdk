const http = require('./https.js');

module.exports = {

  /**
   * 计算手续费
   * @param tx
   * @param signatrueCount 签名数量，默认为1
   **/
  countFee(tx, signatrueCount) {
    let txSize = tx.txSerialize().length;
    txSize += signatrueCount * 110;
    return 100000 * Math.ceil(txSize / 1024);
  },

  /**
   * 获取inputs 、 outputs
   * @param transferInfo
   * @param balanceInfo
   * @param type
   * @returns {*}
   */
  inputsOrOutputs(transferInfo, balanceInfo, type) {
    let newAmount = transferInfo.amount + transferInfo.fee;
    let newLocked = 0;
    let newNonce = balanceInfo.nonce;
    let newoutputAmount = transferInfo.amount;
    let newLockTime = 0;
    if (balanceInfo.balance < transferInfo.amount + transferInfo.fee) {
      return {success: false, data: "Your balance is not enough."}
    }
    if (type === 4) {
      newLockTime = -1;
    } else if (type === 5) {
      newLockTime = -1;
    } else if (type === 6) {
      newAmount = transferInfo.amount;
      newLocked = -1;
      newNonce = transferInfo.depositHash.substring(transferInfo.depositHash.length - 16);
      newoutputAmount = transferInfo.amount - transferInfo.fee;
    } else if (type === 9) {
      newAmount = transferInfo.amount;
      newLocked = -1;
      newNonce = transferInfo.depositHash.substring(transferInfo.depositHash.length - 16);
      newoutputAmount = transferInfo.amount - transferInfo.fee;
    } else {
      //return {success: false, data: "No transaction type"}
    }
    let inputs = [{
      address: transferInfo.fromAddress,
      assetsChainId: transferInfo.assetsChainId,
      assetsId: transferInfo.assetsId,
      amount: newAmount,
      locked: newLocked,
      nonce: newNonce
    }];
    let outputs = [{
      address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
      assetsChainId: transferInfo.assetsChainId,
      assetsId: transferInfo.assetsId,
      amount: newoutputAmount,
      lockTime: newLockTime
    }];
    return {success: true, data: {inputs: inputs, outputs: outputs}};
  },

  /**
   * 获取账户的余额及nonce
   * @param address
   * @returns {Promise<AxiosResponse<any>>}
   */
  async getNulsBalance(address) {
    return await http.post('/', 'getAccountBalance', [1, address])
      .then((response) => {
        return {'balance': response.result.balance, 'nonce': response.result.nonce};
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },

  /**
   * 获取合约代码构造函数
   * @param contractCodeHex
   * @returns {Promise<AxiosResponse<any>>}
   */
  async getContractConstructor(contractCodeHex) {
    return await http.post('/', 'getContractConstructor', [contractCodeHex])
      .then((response) => {
        //console.log(response);
        if (response.hasOwnProperty("result")) {
          return {success: true, data: response.result};
        } else {
          return {success: false, data: response.error};
        }
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },

  /**
   * 获取合约指定函数的参数类型
   * @param chainId, contractAddress, methodName
   * @returns {Promise<AxiosResponse<any>>}
   */
  async getContractMethodArgsTypes(contractAddress, methodName) {
    return await http.post('/', 'getContractMethodArgsTypes', [contractAddress, methodName])
      .then((response) => {
        if (response.hasOwnProperty("result")) {
          return {success: true, data: response.result};
        } else {
          return {success: false, data: response.error};
        }
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },

  /**
   * 验证创建合约交易
   */
  async validateContractCreate(sender, gasLimit, price, contractCode, args) {
    return await http.post('/', 'validateContractCreate', [sender, gasLimit, price, contractCode, args])
      .then((response) => {
        //console.log(response.result);
        return response.result;
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },

  /**
   * 预估创建合约交易的gas
   */
  async imputedContractCreateGas(sender, contractCode, args) {
    return await http.post('/', 'imputedContractCreateGas', [sender, contractCode, args])
      .then((response) => {
        //console.log(response);
        if (response.hasOwnProperty("result")) {
          return response.result.gasLimit
        } else {
          return {success: false, data: response.error};
        }
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },

  /**
   * 验证调用合约交易
   */
  async validateContractCall(sender, value, gasLimit, price, contractAddress, methodName, methodDesc, args) {
    return await http.post('/', 'validateContractCall', [sender, value, gasLimit, price, contractAddress, methodName, methodDesc, args])
      .then((response) => {
        if (response.hasOwnProperty("result")) {
          return {success: true, data: response.result};
        } else {
          return {success: false, data: response.error};
        }
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },


  /**
   * 预估调用合约交易的gas
   */
  async imputedContractCallGas(sender, value, contractAddress, methodName, methodDesc, args) {
    return await http.post('/', 'imputedContractCallGas', [sender, value, contractAddress, methodName, methodDesc, args])
      .then((response) => {
        if (response.hasOwnProperty("result")) {
          return {success: true, data: response.result};
        } else {
          return {success: false, data: response.error};
        }
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },

  /**
   * 验证删除合约交易
   */
  async validateContractDelete(sender, contractAddress) {
    return await http.post('/', 'validateContractDelete', [chainId, sender, contractAddress])
      .then((response) => {
        if (response.hasOwnProperty("result")) {
          return {success: true, data: response.result};
        } else {
          return {success: false, data: response.error};
        }
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },


  /**
   * 验证交易
   * @param txHex
   * @returns {Promise<AxiosResponse<any>>}
   */
  async validateTx(txHex) {
    return await http.post('/', 'validateTx', [txHex])
      .then((response) => {
        if (response.hasOwnProperty("result")) {
          return {success: true, data: response.result};
        } else {
          return {success: false, data: response.error};
        }
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },

  /**
   * 广播交易
   * @param txHex
   * @returns {Promise<AxiosResponse<any>>}
   */
  async broadcastTx(txHex) {
    return await http.post('/', 'broadcastTx', [txHex])
      .then((response) => {
        console.log(response)
        return response.result;
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },

  /**
   * 获取节点的委托列表
   * @param agentHash
   * @returns {Promise<AxiosResponse<any>>}
   */
  async agentDeposistList(agentHash) {
    //todo 这个接口是临时处理，后面要换一个接口，否则超过100个委托会出问题
    return await http.post('/', 'getConsensusDeposit', [1, 100, agentHash])
      .then((response) => {
        return response.result;
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  }
};
