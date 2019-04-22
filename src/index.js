const axios = require('axios');
const sdk = require('./api/sdk');
const txs = require('./model/txs');

module.exports = {

  //生成地址
  newAddress(chainId, passWord) {
    let addressInfo = {};
    if (passWord) {
      addressInfo = sdk.newEcKey(passWord);
      addressInfo.aesPri = sdk.encrypteByAES(addressInfo.pri, passWord);
    } else {
      addressInfo = sdk.newEcKey(passWord);
    }
    addressInfo.address = sdk.getStringAddress(chainId, addressInfo.pri, addressInfo.pub);
    addressInfo.pri = null;
    return addressInfo
  },

  //私钥导入
  importByKey(chainId, pri, passWord) {
    let addressInfo = {};
    addressInfo.pri = pri;
    addressInfo.address = sdk.getStringAddress(chainId, pri);
    addressInfo.pub = sdk.getPub(pri);
    if (passWord) {
      addressInfo.aesPri = sdk.encrypteByAES(addressInfo.pri, passWord);
      addressInfo.pri = null;
    }
    return addressInfo
  },

  //转账交易
  transferTransaction(pri, pub, inputs, outputs, remark) {
    let tt = new txs.TransferTransaction();
    tt.time = (new Date()).valueOf();
    tt.setCoinData(inputs, outputs);
    tt.remark = remark;
    sdk.signatureTx(tt, pri, pub);
    let txhex = tt.txSerialize().toString('hex');
    return txhex
  },

  //交易签名
  transactionSerialize(pri, pub, inputs, outputs, remark, type, depositInfo) {
    let tt = [];
    if (type === 2) { //转账交易
      tt = new txs.TransferTransaction();
    } else if (type === 4) { //创建节点

    } else if (type === 5) { //加入共识
      tt = new txs.DepositTransaction(depositInfo);
    } else if (type === 6) { //退出共识

    } else if (type === 9) { //注销节点

    } else {
      console.log("没有获取到交易类型");
      return false
    }
    tt.time = (new Date()).valueOf();
    tt.setCoinData(inputs, outputs);
    tt.remark = remark;
    sdk.signatureTx(tt, pri, pub);
    return tt.txSerialize().toString('hex');
  },

  //获取input utxo
  async getInputUtxo(fromAddress, amount) {
    return await axios.post('http://116.62.135.185:8081/', {
      "jsonrpc": "2.0",
      "method": "getUTXOS",
      "params": [fromAddress, amount],
      "id": 1234
    })
      .then((response) => {
        return response.data.result;
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },

  //验证交易
  async valiTransaction(transactionInfo) {
    return await axios.post('http://114.116.4.109:8001/api/accountledger/transaction/valiTransaction', {"txHex": transactionInfo})
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },


  async getNulsBalance(address) {
    return await axios.post('http://192.168.1.37:18003/', {
      "jsonrpc": "2.0",
      "method": "getAccountBalance",
      "params": [2, 1, address],
      "id": 1234
    })
      .then((response) => {
        return {'balance': response.data.result.balance, 'nonce': response.data.result.nonce};
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },
  async broadcastTx(txHex) {
    return await axios.post('http://192.168.1.37:18003/', {
      "jsonrpc": "2.0",
      "method": "broadcastTx",
      "params": [2, txHex],
      "id": 1234
    })
      .then((response) => {
        return {'balance': response.data.result.balance, 'nonce': response.data.result.nonce};
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },
  async validateTx(txHex) {
    return await axios.post('http://192.168.1.37:18003/', {
      "jsonrpc": "2.0",
      "method": "validateTx",
      "params": [2, txHex],
      "id": 1234
    })
      .then((response) => {
        return response.data.result;
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },
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
