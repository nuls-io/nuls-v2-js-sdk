const nuls = require('../index');
const sdk = require('../api/sdk')
const {getBalance, countFee, inputsOrOutputs, validateTx, broadcastTx} = require('./api/util');

/**
 * @disc: 创建交易对 dome
 * @params:
 * @date: 2019-12-9 10:38
 * @author: vivi
 */

let pri = '4100e2f88c3dba08e5000ed3e8da1ae4f1e0041b856c09d35a26fb399550f530';
let pub = '020e19418ed26700b0dba720dcc95483cb4adb1b5f8a103818dab17d5b05231854';
let address = "tNULSeBaMu38g1vnJsSZUCwTDU9GsE5TVNUtpD";
let remark = 'create tradingOrder....';
let txType = 29;
let fee = 100000;       //手续费

let defaultAsset = {        //本链默认资产，用于生成手续费
    assetsChainId: 2,
    assetsId: 1
}

let tradingOrderInfo = {
    tradingHash: '2560584b3b33df9676f86230846e666fd645696129799d77ee043269f614862c',    //交易对hash
    address: address,        //挂单委托人
    orderType: 1,            //委托挂单类型 1:买单，2:卖单
    assetsChainId: 2,
    assetsId: 1,
    amount: 10000000000,     //挂单金额
    price: 10000000          //单价
};

//调用委托挂单
tradingOrder(tradingOrderInfo);

/**
 * 委托挂单
 * @param pri
 * @param pub
 * @param fromAddress
 * @param toAddress
 * @param assetsChainId
 * @param assetsId
 * @param amount
 * @param remark
 * @returns {Promise<void>}
 */
async function tradingOrder(tradingOrderInfo) {
    let inOrOutputs = await createCoinData(tradingOrderInfo);

    //交易组装
    let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, txType, tradingOrderInfo);
    console.log(tAssemble);
    //获取hash
    let hash = await tAssemble.getHash();
    console.log(hash);
    //交易签名
    let txSignature = await sdk.getSignData(hash.toString('hex'), pri);
    console.log(txSignature);
    //通过拼接签名、公钥获取HEX
    let signData = await sdk.appSplicingPub(txSignature.signValue, pub);
    tAssemble.signatures = signData;
    let txhex = tAssemble.txSerialize().toString("hex");
    console.log(txhex.toString('hex'));
}

async function createCoinData(tradingOrderInfo) {
    const balanceInfo = await getBalance(defaultAsset.assetsChainId, tradingOrderInfo.assetsChainId, tradingOrderInfo.assetsId, tradingOrderInfo.address);
    let inputs = [], outputs = [];
    let input = {
        address: tradingOrderInfo.address,
        assetsChainId: tradingOrderInfo.assetsChainId,
        assetsId: tradingOrderInfo.assetsId,
        amount: tradingOrderInfo.amount,
        locked: 0,
        nonce: balanceInfo.nonce
    };
    //判断用户的挂单委托资产是否是本链的默认资产
    if (tradingOrderInfo.assetsChainId === defaultAsset.assetsChainId && tradingOrderInfo.assetsId === defaultAsset.assetsId) {
        //如果是，生成input的时候，将委托金额和手续费一起收
        input.amount += fee;
        inputs.push(input);
    } else {
        //如果不是要额外收取手续费
        inputs.push(input);
        const balanceInfo = await getBalance(defaultAsset.assetsChainId, defaultAsset.assetsChainId, defaultAsset.assetsId, tradingOrderInfo.address);
        inputs.push({
            address: tradingOrderInfo.address,
            assetsChainId: tradingOrderInfo.assetsChainId,
            assetsId: tradingOrderInfo.assetsId,
            amount: fee,
            locked: 0,
            nonce: balanceInfo.nonce
        });
    }

    outputs.push({
        address: tradingOrderInfo.address,
        assetsChainId: tradingOrderInfo.assetsChainId,
        assetsId: tradingOrderInfo.assetsId,
        amount: tradingOrderInfo.amount,
        lockTime: -2
    });
    return {success: true, data: {inputs: inputs, outputs: outputs}};
}




