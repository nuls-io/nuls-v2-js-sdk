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
      addressInfo.address = sdk.getStringAddress(addressInfo.pri, addressInfo.pub);
    } else {
      addressInfo = sdk.newEcKey(passWord);
      addressInfo.address = sdk.getStringAddress(chainId, addressInfo.pri, addressInfo.pub);
    }
    return addressInfo
  },

  //私钥导入
  importByKey(chainId, pri, passWord) {
    let addressInfo = {};
    addressInfo.pri = pri;
    addressInfo.address = sdk.getStringAddress(chainId, pri);
    addressInfo.pub = sdk.getPub(pri);

    /*if(passWord){
      addressInfo.pri = pri;
      addressInfo.aesPri = sdk.encrypteByAES(addressInfo.pri,passWord);
      addressInfo.address = sdk.getStringAddress(pri);
      addressInfo.pub = sdk.getPub(pri);
    }else {
      addressInfo.pri = pri;
      addressInfo.address = sdk.getStringAddress(pri);
      addressInfo.pub = sdk.getPub(pri);
    }*/
    return addressInfo
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

  //广播交易
  async broadcast(transactionInfo) {
    return await axios.post('http://114.116.4.109:8001/api/accountledger/transaction/broadcast', {txHex: transactionInfo})
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return {success: false, data: error};
      });
  },

  //转账交易
  transferTransaction(pri, pub, inputsOwner, outputsOwner, remark) {
    let tx = new txs.TransferTransaction();
    tx.remark = remark;
    tx.time = (new Date()).valueOf();
    tx.inputs = inputsOwner;
    tx.outputs = outputsOwner;
    //计算hash
    let hash = sdk.getTxHash(tx);
    //签名
    sdk.signatureTx(tx, pub, pri);
    return {hash: hash.toString('hex'), signature: tx.txSerialize().toString('hex')}
  }
};
