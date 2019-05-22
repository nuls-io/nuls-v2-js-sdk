const sdk = require('./api/sdk');
const txs = require('./model/txs');

module.exports = {

  /**
   * 生成地址
   * @param chainId
   * @param passWord
   * @returns {{}}
   */
  newAddress(chainId, passWord) {
    let addressInfo = {};
    if (passWord) {
      addressInfo = sdk.newEcKey(passWord);
      addressInfo.aesPri = sdk.encrypteByAES(addressInfo.pri, passWord);
      addressInfo.pri = null;
    } else {
      addressInfo = sdk.newEcKey(passWord);
    }
    addressInfo.address = sdk.getStringAddress(chainId, addressInfo.pri, addressInfo.pub);
    return addressInfo
  },

  /**
   * 导入地址
   * @param chainId
   * @param pri
   * @param passWord
   * @returns {{}}
   */
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

  /**
   * 组装交易
   * @param inputs
   * @param outputs
   * @param remark
   * @param type
   * @param info
   * @returns {Array}
   */
  transactionAssemble(inputs, outputs, remark, type, info) {
    let tt = [];
    if (type === 2) { //转账交易
      tt = new txs.TransferTransaction();
    }  if (type === 3) { //设置别名
      tt = new txs.AliasTransaction(info.fromAddress,info.alias);
    } else if (type === 4) { //创建节点
      tt = new txs.CreateAgentTransaction(info);
    } else if (type === 5) { //加入共识
      tt = new txs.DepositTransaction(info);
    } else if (type === 6) { //退出共识
      tt = new txs.WithdrawTransaction(info);
    } else if (type === 9) { //注销节点
      tt = new txs.StopAgentTransaction(info);
    } else if (type === 15) { //创建合约
      tt = new txs.CreateContractTransaction(info);
    } else if (type === 16) { //调用合约
      tt = new txs.CallContractTransaction(info);
    } else if (type === 17) { //删除合约
      tt = new txs.DeleteContractTransaction(info);
    }
    tt.time = (new Date()).valueOf();
    tt.setCoinData(inputs, outputs);
    tt.remark = remark;
    return tt
  },

  /**
   * 交易签名
   * @param pri
   * @param pub
   * @param tAssemble
   * @returns {boolean}
   */
  transactionSerialize(pri, pub, tAssemble) {
    sdk.signatureTx(tAssemble, pri, pub);
    return tAssemble.txSerialize().toString('hex');
  },

  /**
   * 解密私钥
   * @param aesPri
   * @param password
   * @returns {*}
   */
  decrypteOfAES(aesPri,password){
    return sdk.decrypteOfAES(aesPri,password)
  }

};
