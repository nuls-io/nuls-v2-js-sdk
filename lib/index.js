'use strict';

var sdk = require('./api/sdk');
var txs = require('./model/txs');
var crypto = require("./crypto/eciesCrypto");

module.exports = {

    /**
     * 生成地址
     * @param chainId
     * @param passWord
     * @param prefix
     * @returns {{}}
     */
    newAddress: function newAddress(chainId, passWord, prefix) {
        var addressInfo = { "prefix": prefix };
        if (passWord) {
            addressInfo = sdk.newEcKey(passWord);
            addressInfo.aesPri = sdk.encrypteByAES(addressInfo.pri, passWord);
            addressInfo.pri = null;
        } else {
            addressInfo = sdk.newEcKey(passWord);
        }
        addressInfo.address = sdk.getStringAddress(chainId, addressInfo.pri, addressInfo.pub, prefix);
        return addressInfo;
    },


    /**
     * 1.0与2.0的私钥或公钥生成地址是否相同
     * @param addressV1
     * @param addressV2
     * @returns {*}
     */
    addressEquals: function addressEquals(addressV1, addressV2) {
        return sdk.addressEquals(addressV1, addressV2);
    },


    /**
     * 根据公钥获取地址
     * @param chainId
     * @param assetId
     * @param pub
     * @param prefix
     * @returns {*|string}
     */
    getAddressByPub: function getAddressByPub(chainId, assetId, pub, prefix) {
        return sdk.getStringAddressBase(chainId, assetId, '', pub, prefix);
    },


    /**
     * 验证地址
     * @param address
     * @returns {*}
     */
    verifyAddress: function verifyAddress(address) {
        return sdk.verifyAddress(address);
    },


    /**
     * 导入地址
     * @param chainId
     * @param pri
     * @param passWord
     * @param prefix
     * @returns {{}}
     */
    importByKey: function importByKey(chainId, pri, passWord, prefix) {
        var addressInfo = {};
        addressInfo.pri = pri;
        addressInfo.address = sdk.getStringAddress(chainId, pri, null, prefix);
        addressInfo.pub = sdk.getPub(pri);
        if (passWord) {
            addressInfo.aesPri = sdk.encrypteByAES(addressInfo.pri, passWord);
            addressInfo.pri = null;
        }
        return addressInfo;
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
    transactionAssemble: function transactionAssemble(inputs, outputs, remark, type, info) {
        var tt = [];
        if (type === 2) {
            //转账交易
            tt = new txs.TransferTransaction();
        } else if (type === 3) {
            //设置别名
            tt = new txs.AliasTransaction(info.fromAddress, info.alias);
        } else if (type === 4) {
            //创建节点
            tt = new txs.CreateAgentTransaction(info);
        } else if (type === 5) {
            //加入共识
            tt = new txs.DepositTransaction(info);
        } else if (type === 6) {
            //退出共识
            tt = new txs.WithdrawTransaction(info);
        } else if (type === 9) {
            //注销节点
            tt = new txs.StopAgentTransaction(info, outputs[0].lockTime - 86400 * 3);
        } else if (type === 11) {
            //注销节点
            tt = new txs.RegisterChainAndAssetTransaction(info);
        } else if (type === 15) {
            //创建合约
            tt = new txs.CreateContractTransaction(info);
        } else if (type === 16) {
            //调用合约
            tt = new txs.CallContractTransaction(info);
        } else if (type === 17) {
            //删除合约
            tt = new txs.DeleteContractTransaction(info);
        } else if (type === 10) {
            //跨链转账
            tt = new txs.CrossChainTransaction();
        }
        tt.setCoinData(inputs, outputs);
        tt.remark = remark;
        return tt;
    },


    /**
     * 交易签名
     * @param pri
     * @param pub
     * @param tAssemble
     * @returns {boolean}
     */
    transactionSerialize: function transactionSerialize(pri, pub, tAssemble) {
        sdk.signatureTx(tAssemble, pri, pub);
        return tAssemble.txSerialize().toString('hex');
    },


    /**
     * 交易签名
     * @param pri
     * @param tAssemble
     * @returns {boolean}
     */
    transactionSignature: function transactionSignature(pri, tAssemble) {
        return sdk.signatureTransaction(tAssemble, pri);
    },


    /**
     * 解密私钥
     * @param aesPri
     * @param password
     * @returns {*}
     */
    decrypteOfAES: function decrypteOfAES(aesPri, password) {
        return sdk.decrypteOfAES(aesPri, password);
    },


    /**
     * 公钥加密内容
     * @param pub
     * @param data
     * @returns {Promise<string>}
     */
    encryptOfECIES: async function encryptOfECIES(pub, data) {
        var bufferData = Buffer.from(data);
        var encrypted = await eccrypto.encrypt(pub, bufferData);
        return encrypted.toString("hex");
    },


    /**
     * 私钥解密内容
     * @param pri
     * @param encrypted
     * @returns {Promise<string>}
     */
    decryptOfECIES: async function decryptOfECIES(pri, encrypted) {
        var bufferEncrypted = Buffer.from(encrypted, "hex");
        var decrypted = await eccrypto.decrypt(pri, bufferData);
        return decrypted.toString();
    }
};