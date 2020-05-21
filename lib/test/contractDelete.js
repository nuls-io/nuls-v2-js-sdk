'use strict';

var nuls = require('../index');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    inputsOrOutputs = _require.inputsOrOutputs,
    validateContractDelete = _require.validateContractDelete,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx;

module.exports = {
    /**
     * 调用删除合约
     * @param pri
     * @param pub
     * @param fromAddress
     * @param assetsChainId
     * @param assetsId
     * @param contractDelete
     * @returns {Promise<void>}
     */
    deleteContract: async function deleteContract(pri, pub, fromAddress, assetsChainId, assetsId, contractDelete, remark) {
        var balanceInfo = await getNulsBalance(fromAddress);
        var amount = 0;
        var transferInfo = {
            fromAddress: fromAddress,
            assetsChainId: assetsChainId,
            assetsId: assetsId,
            amount: amount,
            fee: 100000
        };

        var contractDeleteTxData = await this.makeDeleteData(contractDelete.chainId, contractDelete.sender, contractDelete.contractAddress);

        var deleteValidateResult = await validateContractDelete(assetsChainId, contractDeleteTxData.sender, contractDeleteTxData.contractAddress);
        if (!deleteValidateResult) {
            console.log("验证删除合约失败");
            return;
        }
        var inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 17);
        var tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 17, contractDeleteTxData);
        var txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
        var result = await validateTx(txhex);
        console.log(result);
        if (result) {
            var results = await broadcastTx(txhex);
            if (results && results.value) {
                console.log("交易完成");
            } else {
                console.log("广播交易失败");
            }
        } else {
            console.log("验证交易失败");
        }
    },


    /**
     * 组装创建合约交易的txData
     * @param chainId
     * @param sender
     * @param contractAddress
     * @returns {Promise<{}>}
     */
    makeDeleteData: async function makeDeleteData(chainId, sender, contractAddress) {
        var contractDelete = {};
        contractDelete.chainId = chainId;
        contractDelete.sender = sender;
        contractDelete.contractAddress = contractAddress;
        return contractDelete;
    }
};