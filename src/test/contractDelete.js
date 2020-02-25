const nuls = require('../index');
const {getNulsBalance, inputsOrOutputs, validateContractDelete, validateTx, broadcastTx} = require('./api/util');

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
    async deleteContract(pri, pub, fromAddress, assetsChainId, assetsId, contractDelete, remark) {
        const balanceInfo = await getNulsBalance(fromAddress);
        let amount = 0;
        let transferInfo = {
            fromAddress: fromAddress,
            assetsChainId: assetsChainId,
            assetsId: assetsId,
            amount: amount,
            fee: 100000
        };

        const contractDeleteTxData = await this.makeDeleteData(contractDelete.chainId, contractDelete.sender, contractDelete.contractAddress);

        let deleteValidateResult = await validateContractDelete(assetsChainId, contractDeleteTxData.sender, contractDeleteTxData.contractAddress);
        if (!deleteValidateResult) {
            console.log("验证删除合约失败");
            return;
        }
        let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 17);
        let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 17, contractDeleteTxData);
        let txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
        let result = await validateTx(txhex);
        console.log(result);
        if (result) {
            let results = await broadcastTx(txhex);
            if (results && results.value) {
                console.log("交易完成")
            } else {
                console.log("广播交易失败")
            }
        } else {
            console.log("验证交易失败")
        }
    },

    /**
     * 组装创建合约交易的txData
     * @param chainId
     * @param sender
     * @param contractAddress
     * @returns {Promise<{}>}
     */
    async makeDeleteData(chainId, sender, contractAddress) {
        let contractDelete = {};
        contractDelete.chainId = chainId;
        contractDelete.sender = sender;
        contractDelete.contractAddress = contractAddress;
        return contractDelete;
    }
}

