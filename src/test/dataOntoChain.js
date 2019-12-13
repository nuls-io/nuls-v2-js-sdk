const nuls = require('../index');
const {getNulsBalance, countFee, inputsOrOutputs, validateTx, broadcastTx} = require('./api/util');
const sdk = require('../api/sdk');

let address = 'tNULSeBaMuG5b4KuWuSg8rvNPttqWThhFsH3ns';
let pri = "642d33a2fe29e40c6e5ee8aafd16da9699e1b9fbba45de7bb879831bed2cbd59";
//上链数据：NULS主网创世块hash
let data = '8221e980cc9707b4fcf05ac79e70b8ac75f00550bb7da9292e6d6432a716ea88';

//调用
transferTransaction(pri, address, data);

/**
 * 基于转账交易的数据上链交易示例
 * @param pri
 * @param address
 * @param data
 * @returns {Promise<void>}
 */
async function transferTransaction(pri, address, data) {
    let remark = '测试数据上链';
    //获取余额和nonce
    const balanceInfo = await getNulsBalance(address);

    let pub = sdk.getPub(pri);

    let transferInfo = {
        fromAddress: address,
        assetsChainId: 2,
        assetsId: 1,
        amount: 0,
        fee: 100000
    };
    let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 2);
    let tAssemble = [];//交易组装
    let txhex = "";//交易签名
    if (inOrOutputs.success) {
        tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 2);
        //获取手续费
        let newFee = countFee(tAssemble, 1);
        //手续费大于0.001的时候重新组装交易及签名
        if (transferInfo.fee !== newFee) {
            transferInfo.fee = newFee;
            inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 2);
            tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 2);
            txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
        } else {
            txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
        }
    } else {
        console.log(inOrOutputs.data)
    }
    console.log(txhex);
    let result = await validateTx(txhex);
    if (result.success) {
        console.log(result.data.value);
        let results = await broadcastTx(txhex);
        if (results && results.value) {
            console.log("交易完成")
        } else {
            console.log("广播交易失败")
        }
    } else {
        console.log("验证交易失败:" + result.error.message)
    }
}
