'use strict';

var axios = require('axios');
var sdk = require('./api/sdk');
var txs = require('./model/txs');

module.exports = {

    //生成地址
    newAddress: function newAddress(chainId, passWord) {
        var addressInfo = {};
        if (passWord) {
            addressInfo = sdk.newEcKey(passWord);
            addressInfo.aesPri = sdk.encrypteByAES(addressInfo.pri, passWord);
        } else {
            addressInfo = sdk.newEcKey(passWord);
        }
        addressInfo.address = sdk.getStringAddress(chainId, addressInfo.pri, addressInfo.pub);
        addressInfo.pri = null;
        return addressInfo;
    },


    //私钥导入
    importByKey: function importByKey(chainId, pri, passWord) {
        var addressInfo = {};
        addressInfo.pri = pri;
        addressInfo.address = sdk.getStringAddress(chainId, pri);
        addressInfo.pub = sdk.getPub(pri);
        if (passWord) {
            addressInfo.aesPri = sdk.encrypteByAES(addressInfo.pri, passWord);
            addressInfo.pri = null;
        }
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


    //转账交易
    transferTransaction: function transferTransaction(pri, pub, inputs, outputs, remark) {
        var tt = new txs.TransferTransaction();
        tt.time = new Date().valueOf();
        tt.setCoinData(inputs, outputs);
        tt.remark = remark;
        sdk.signatureTx(tt, pri, pub);
        var txhex = tt.txSerialize().toString('hex');
        return txhex;
    },
    getNulsBalance: async function getNulsBalance(address) {
        return await axios.post('http://192.168.1.37:18003/', {
            "jsonrpc": "2.0",
            "method": "getAccountBalance",
            "params": [2, 1, address],
            "id": 1234
        }).then(function (response) {
            return { 'balance': response.data.result.balance, 'nonce': response.data.result.nonce };
        }).catch(function (error) {
            return { success: false, data: error };
        });
    },
    broadcastTx: async function broadcastTx(txHex) {
        return await axios.post('http://192.168.1.37:18003/', {
            "jsonrpc": "2.0",
            "method": "broadcastTx",
            "params": [2, txHex],
            "id": 1234
        }).then(function (response) {
            return { 'balance': response.data.result.balance, 'nonce': response.data.result.nonce };
        }).catch(function (error) {
            return { success: false, data: error };
        });
    },
    validateTx: async function validateTx(txHex) {
        return await axios.post('http://192.168.1.37:18003/', {
            "jsonrpc": "2.0",
            "method": "validateTx",
            "params": [2, txHex],
            "id": 1234
        }).then(function (response) {
            return response.data.result;
        }).catch(function (error) {
            return { success: false, data: error };
        });
    },
    getAgentDeposistList: async function getAgentDeposistList(agentHash) {
        //todo 这个接口是临时处理，后面要换一个接口，否则超过100个委托会出问题
        return await axios.post('http://192.168.1.37:18003/', {
            "jsonrpc": "2.0",
            "method": "getConsensusDeposit",
            "params": [2, 1, 100, agentHash],
            "id": 1234
        }).then(function (response) {
            return response.data.result.list;
        }).catch(function (error) {
            return { success: false, data: error };
        });
    }
};