"use strict";

var http = require('./https.js');

module.exports = {

  /**
   * 计算手续费
   */
  countFee: function countFee() {
    //计算手续费 （124 + 50  * inputs.length + 38 * outputs.length + remark.bytes.length ）/1024
    return 100000;
  },


  /**
   * 获取inputs 、 outputs
   * @param transferInfo
   * @param balanceInfo
   * @param type
   * @returns {*}
   */
  inputsOrOutputs: function inputsOrOutputs(transferInfo, balanceInfo, type) {
    var newAmount = transferInfo.amount + transferInfo.fee;
    var newLocked = 0;
    var newNonce = balanceInfo.nonce;
    var newoutputAmount = transferInfo.amount;
    var newLockTime = 0;

    if (balanceInfo.balance < transferInfo.amount + transferInfo.fee) {
      return { success: false, data: "Your balance is not enough." };
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
      console.log("没有交易类型");
    }

    var inputs = [{
      address: transferInfo.fromAddress,
      assetsChainId: transferInfo.assetsChainId,
      assetsId: transferInfo.assetsId,
      amount: newAmount,
      locked: newLocked,
      nonce: newNonce
    }];

    var outputs = [{
      address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
      assetsChainId: transferInfo.assetsChainId,
      assetsId: transferInfo.assetsId,
      amount: newoutputAmount,
      lockTime: newLockTime
    }];

    return { inputs: inputs, outputs: outputs };
  },


  /**
   * 获取账户的余额及nonce
   * @param address
   * @returns {Promise<AxiosResponse<any>>}
   */
  getNulsBalance: async function getNulsBalance(address) {
    return await http.post('/', 'getAccountBalance', [1, address]).then(function (response) {
      return { 'balance': response.result.balance, 'nonce': response.result.nonce };
    }).catch(function (error) {
      return { success: false, data: error };
    });
  },


  /**
   * 验证交易
   * @param txHex
   * @returns {Promise<AxiosResponse<any>>}
   */
  validateTx: async function validateTx(txHex) {
    return await http.post('/', 'validateTx', [txHex]).then(function (response) {
      return response.result;
    }).catch(function (error) {
      return { success: false, data: error };
    });
  },


  /**
   * 广播交易
   * @param txHex
   * @returns {Promise<AxiosResponse<any>>}
   */
  broadcastTx: async function broadcastTx(txHex) {
    return await http.post('/', 'broadcastTx', [txHex]).then(function (response) {
      return response.result;
    }).catch(function (error) {
      return { success: false, data: error };
    });
  },


  /**
   * 获取节点的委托列表
   * @param agentHash
   * @returns {Promise<AxiosResponse<any>>}
   */
  agentDeposistList: async function agentDeposistList(agentHash) {
    //todo 这个接口是临时处理，后面要换一个接口，否则超过100个委托会出问题
    return await http.post('/', 'getConsensusDeposit', [1, 100, agentHash]).then(function (response) {
      return response.result;
    }).catch(function (error) {
      return { success: false, data: error };
    });
  }
};