'use strict';

var axios = require('axios');
var sdk = require('./api/sdk');
var txs = require('./model/txs');

module.exports = {

    //生成地址
    newAddress: function newAddress(chainId, passWord) {
        var addressInfo = {};
        if (passWord) {} else {
            addressInfo = sdk.newEcKey(passWord);
            addressInfo.address = sdk.getStringAddress(chainId, addressInfo.pri, addressInfo.pub);
        }
        return addressInfo;
    },


    //私钥导入
    importByKey: function importByKey(chainId, pri) {
        var addressInfo = {};
        addressInfo.pri = pri;
        addressInfo.address = sdk.getStringAddress(chainId, pri);
        addressInfo.pub = sdk.getPub(pri);
        return addressInfo;
    },


    //获取input utxo
    getInputUtxo: async function getInputUtxo(fromAddress, amount) {
        return await axios.post('http://116.62.135.185:8081/', {
            "jsonrpc": "2.0",
            "method": "getUTXOS",
            "params": [fromAddress, amount],
            "id": 1234
        }).then(function (response) {
            return response.data.result;
        }).catch(function (error) {
            return { success: false, data: error };
        });
    },


    //验证交易
    valiTransaction: async function valiTransaction(transactionInfo) {
        return await axios.post('http://114.116.4.109:8001/api/accountledger/transaction/valiTransaction', { "txHex": transactionInfo }).then(function (response) {
            return response;
        }).catch(function (error) {
            return { success: false, data: error };
        });
    },


    //广播交易
    broadcast: async function broadcast(transactionInfo) {
        return await axios.post('http://114.116.4.109:8001/api/accountledger/transaction/broadcast', { txHex: transactionInfo }).then(function (response) {
            return response;
        }).catch(function (error) {
            return { success: false, data: error };
        });
    },


    //转账交易
    transferTransaction: function transferTransaction(pri, pub, inputsOwner, outputsOwner, remark) {
        var tx = new txs.TransferTransaction();
        tx.remark = remark;
        tx.time = new Date().valueOf();
        tx.inputs = inputsOwner;
        tx.outputs = outputsOwner;
        //计算hash
        var hash = sdk.getTxHash(tx);
        //签名
        sdk.signatureTx(tx, pub, pri);
        return { hash: hash.toString('hex'), signature: tx.txSerialize().toString('hex') };
    }
};