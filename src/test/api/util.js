const http = require('./https.js');

module.exports = {

  /**
   * 判断是否为主网
   * @param chainId
   **/
  isMainNet(chainId) {
    if (chainId === 2) {
      return true;
    }
    return false;
  },

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
   * 计算跨链交易手续费
   * @param tx
   * @param signatrueCount 签名数量，默认为1
   **/
  countCtxFee(tx, signatrueCount) {
    let txSize = tx.txSerialize().length;
    txSize += signatrueCount * 110;
    return 1000000 * Math.ceil(txSize / 1024);
  },

  /**
   * 获取inputs 、 outputs
   * @param transferInfo
   * @param balanceInfo
   * @param type
   * @returns {*}
   */
  mutiInputsOrOutputs(transferInfo, balanceInfo, type) {
    let newAmount = transferInfo.from.amount + transferInfo.fee;
    let newLocked = 0;
    let newNonce = balanceInfo.nonce;
    if (balanceInfo.balance < newAmount) {
      return {success: false, data: "Your balance is not enough."}
    }
    let inputs = [{
      address: transferInfo.from.fromAddress,
      assetsChainId: transferInfo.assetsChainId,
      assetsId: transferInfo.assetsId,
      amount: newAmount,
      locked: newLocked,
      nonce: newNonce
    }];
    let outputs = [];
    for (let i = 0; i < transferInfo.to.length; i++) {
      let to = transferInfo.to[i];
      outputs.push({
        address: to.toAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: to.amount,
        lockTime: to.lockTime ? to.lockTime : 0
      })
    }
    return {success: true, data: {inputs: inputs, outputs: outputs}};
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
      //锁定三天
      let times = (new Date()).valueOf() + 3600000 * 72;
      newLockTime = Number(times.toString().substr(0, times.toString().length - 3));
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
    let outputs = [];
    if (type === 15 || type === 17) {
      return {success: true, data: {inputs: inputs, outputs: outputs}};
    }
    if (type === 16) {
      if (!transferInfo.toAddress) {
        return {success: true, data: {inputs: inputs, outputs: outputs}};
      } else {
        newoutputAmount = transferInfo.value;
      }
    }
    // if (newoutputAmount != 0) {
    outputs = [{
      address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
      assetsChainId: transferInfo.assetsChainId,
      assetsId: transferInfo.assetsId,
      amount: newoutputAmount,
      lockTime: newLockTime
    }];
    // }
    /*console.log(inputs);
    console.log(outputs);*/
    return {success: true, data: {inputs: inputs, outputs: outputs}};
  },

  /**
   * 获取跨链交易inputs 、 outputs
   * @param transferInfo
   * @param balanceInfo
   * @param chainId
   * @returns {*}
   */
  async ctxInputsOrOutputs(transferInfo, balanceInfo, chainId) {
    let inputs = [];
    let outputs = [{
      address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
      assetsChainId: transferInfo.assetsChainId,
      assetsId: transferInfo.assetsId,
      amount: transferInfo.amount,
      lockTime: 0
    }];

    let mainNetBalanceInfo = await this.getBalance(chainId, 2, 1, transferInfo.fromAddress);
    let localBalanceInfo;
    //如果不是主网需要收取NULS手续费
    if (!isMainNet(chainId)) {
      if (mainNetBalanceInfo.balance < transferInfo.fee) {
        console.log("余额不足");
        return;
      }
    }

    //如果转出资产为本链主资产，则直接将手续费加到转出金额上
    if (chainId === transferInfo.assetsChainId && transferInfo.assetsId === 1) {
      let newAmount = transferInfo.amount + transferInfo.fee;
      if (balanceInfo.balance < transferInfo.amount + transferInfo.fee) {
        console.log("余额不足");
        return;
      }
      //转出的本链资产 = 转出资产amount + 本链手续费
      inputs.push({
        address: transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: newAmount,
        locked: 0,
        nonce: balanceInfo.nonce
      });
      //如果不是主网需收取主网NULS手续费
      if (!isMainNet(chainId)) {
        inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: 2,
          assetsId: 1,
          amount: transferInfo.fee,
          locked: 0,
          nonce: mainNetBalanceInfo.nonce
        });
      }
    } else {
      localBalanceInfo = await this.getBalance(chainId, chainId, 1, transferInfo.fromAddress);
      if (localBalanceInfo.balance < transferInfo.fee) {
        console.log("该账户本链主资产不足够支付手续费！");
        return;
      }
      //如果转出的是NULS，则需要把NULS手续费添加到转出金额上
      if (transferInfo.assetsChainId === 2 && transferInfo.assetsId === 1) {
        let newAmount = transferInfo.amount + transferInfo.fee;
        if (mainNetBalanceInfo.balance < newAmount) {
          console.log("余额不足");
          return;
        }
        inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: newAmount,
          locked: 0,
          nonce: mainNetBalanceInfo.nonce
        });
      } else {
        inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: transferInfo.amount,
          locked: 0,
          nonce: balanceInfo.nonce
        });
        inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: 2,
          assetsId: 1,
          amount: transferInfo.fee,
          locked: 0,
          nonce: mainNetBalanceInfo.nonce
        });
      }
      //本链主资产手续费
      if (!isMainNet(chainId)) {
        inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: chainId,
          assetsId: 1,
          amount: transferInfo.fee,
          locked: 0,
          nonce: localBalanceInfo.nonce
        });
      }
    }
    return {success: true, data: {inputs: inputs, outputs: outputs}};
  },

  /**
   * 获取账户的余额及nonce
   * @param address
   * @param chainId
   * @param assetChainId
   * @param assetId
   * @returns {Promise<AxiosResponse<any>>}
   */
  async getBalance(chainId, assetChainId = 2, assetId = 1, address) {
    return await http.postComplete('/', 'getAccountBalance', [chainId, assetChainId, assetId, address])
      .then((response) => {
        //console.log(response);
        return {'balance': response.result.balance, 'nonce': response.result.nonce};
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },

  /**
   * 获取账户的余额及nonce
   * @param address
   * @returns {Promise<AxiosResponse<any>>}
   */
  async getNulsBalance(address) {
    return await http.post('/', 'getAccountBalance', [2, 1, address])
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
   * @param contractAddress
   * @param methodName
   * @param methodDesc
   * @returns {Promise<AxiosResponse<any>>}
   */
  async getContractMethodArgsTypes(contractAddress, methodName, methodDesc) {
    return await http.post('/', 'getContractMethodArgsTypes', [contractAddress, methodName, methodDesc])
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
   * @param sender
   * @param gasLimit
   * @param price
   * @param contractCode
   * @param args
   * @returns {Promise<T>}
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
   * @param sender
   * @param contractCode
   * @param args
   * @returns {Promise<T>}
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
   * @param sender
   * @param value
   * @param gasLimit
   * @param price
   * @param contractAddress
   * @param methodName
   * @param methodDesc
   * @param args
   * @returns {Promise<T>}
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
   * @param sender
   * @param value
   * @param contractAddress
   * @param methodName
   * @param methodDesc
   * @param args
   * @returns {Promise<T>}
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
   * @param sender
   * @param contractAddress
   * @returns {Promise<T>}
   */
  async validateContractDelete(sender, contractAddress) {
    return await http.post('/', 'validateContractDelete', [sender, contractAddress])
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
        //console.log(response);
        if (response.hasOwnProperty("result")) {
          return {success: true, data: response.result};
        } else {
          return {success: false, error: response.error};
        }
      })
      .catch((error) => {
        return {success: false, error: error};
      });
  },

  /**
   * 获取所有地址前缀映射关系
   * @returns {Promise<AxiosResponse<any>>}
   */
  async getAllAddressPrefix() {
    return await http.post('/', 'getAllAddressPrefix', [])
      .then((response) => {
        console.log(response);
        if (response.hasOwnProperty("result")) {
          let data = {};

          for (var i = 0; i < response.result.length; i++) {
            data[response.result[i].chainId] = response.result[i].addressPrefix
          }

          return {success: true, data: data};
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
        if (response.hasOwnProperty("result")) {
          return response.result;
        } else {
          return response.error;
        }
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },

  /**
   * 跨链交易广播
   * @param txHex
   * @returns {Promise<AxiosResponse<any>>}
   */
  async sendCrossTx(txHex) {
    return await http.post('/', 'sendCrossTx', [8, txHex])
      .then((response) => {
        console.log(response);
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
