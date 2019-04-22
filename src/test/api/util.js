const http = require('./https.js');

module.exports = {

  /**
   * 计算手续费
   */
  countFee() {
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
  inputsOrOutputs(transferInfo, balanceInfo, type) {
    let newAmount = transferInfo.amount + transferInfo.fee;
    let newLocked = 0;
    let newNonce = balanceInfo.nonce;
    let newoutputAmount = transferInfo.amount;
    let newLockTime = 0;

    if (balanceInfo.balance < transferInfo.amount + transferInfo.fee) {
      return {success: false, data: "Your balance is not enough."}
    }

    if(type ===4){
      newLockTime = -1;
    } else if(type === 5) {
      newLockTime = -1;
    } else if (type === 6) {
      newAmount = transferInfo.amount;
      newLocked = -1;
      newNonce = transferInfo.depositHash.substring(transferInfo.depositHash.length - 16);
      newoutputAmount = transferInfo.amount - transferInfo.fee;
    } else {
      console.log("没有交易类型")
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

    return {inputs: inputs, outputs: outputs}
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
   * 验证交易
   * @param txHex
   * @returns {Promise<AxiosResponse<any>>}
   */
  async validateTx(txHex) {
    return await http.post('/', 'validateTx', [txHex])
      .then((response) => {
        return response.result;
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
  async getAgentDeposistList(agentHash) {
    //todo 这个接口是临时处理，后面要换一个接口，否则超过100个委托会出问题
    return await axios.post('http://192.168.1.37:18003/', {
      "jsonrpc": "2.0",
      "method": "getConsensusDeposit",
      "params": [2, 1, 100, agentHash],
      "id": 1234
    })
      .then((response) => {
        return response.data.result.list;
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  }
};
