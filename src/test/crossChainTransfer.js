const nuls = require('../index');
const txs = require('../model/txs');
const Serializers = require("../api/serializers");
const {isMainNet, countCtxFee, getBalance, ctxInputsOrOutputs, validateTx, broadcastTx} = require('./api/util');

/*let pri = '9ce21dad67e0f0af2599b41b515a7f7018059418bab892a7b68f283d489abc4b';//tNULSeBaMvEtDfvZuukDf2mVyfGo3DdiN8KLRG
let pub = '03958b790c331954ed367d37bac901de5c2f06ac8368b37d7bd6cd5ae143c1d7e3';
let fromAddress = "tNULSeBaMvEtDfvZuukDf2mVyfGo3DdiN8KLRG";
let toAddress = '8CPcA7kaj56TWAC3Cix64aYCU3XFoNpu1LN1K';*/
let pri = "2b268718adc69586a38aa146987a7e365fac171b995d517cb8f166d8327bb5b1";//8CPcA7kaXSHbWb3GHP7bd5hRLFu8RZv57rY9w
let pub = '02b740f2e2ab7a219bca2a0251dffdffdc4e412f036f94443e3683cdb39f07f292';
let fromAddress = "8CPcA7kaXSHbWb3GHP7bd5hRLFu8RZv57rY9w";
let toAddress = 'tNULSeBaMvEtDfvZuukDf2mVyfGo3DdiN8KLRG';
let amount = 222000000;
let remark = '垮了交易备注...';

/**
 * 转账交易
 * @param pri
 * @param pub
 * @param fromAddress
 * @param toAddress
 * @param chainId
 * @param assetsChainId
 * @param assetsId
 * @param amount
 * @param remark
 * @returns {Promise<void>}
 */
async function transferTransaction(pri, pub, fromAddress, toAddress, chainId, assetsChainId, assetsId, amount, remark) {
  //账户转出资产余额
  const balanceInfo = await getBalance(100, 100, 1, fromAddress);
  //console.log(balanceInfo);
  let transferInfo = {
    fromAddress: fromAddress,
    toAddress: toAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 1000000
  };

  let inOrOutputs = await ctxInputsOrOutputs(transferInfo, balanceInfo);
  let tAssemble = [];//交易组装
  let ctxSign = "";//本链协议交易签名
  let mainCtxSign = "";//主网协议交易签名
  let bw = new Serializers();
  let mainCtx = new txs.CrossChainTransaction();
  let pubHex = Buffer.from(pub, 'hex');
  const mainNetBalanceInfo = await getBalance(chainId, 2, 1, fromAddress);

  if (inOrOutputs.success) {
    tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 10);
    let newFee = 0;
    //获取手续费
    if (isMainNet(chainId)) {
      newFee = countCtxFee(tAssemble, 1)
    } else {
      newFee = countCtxFee(tAssemble, 2);
      if (mainNetBalanceInfo.balance < newFee) {
        console.log("Your balance is not enough.");
        return
      }
      mainCtx.time = tAssemble.time;
      mainCtx.remark = tAssemble.remark;
      let mainNetInputs = [{
        address: transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: transferInfo.amount,
        locked: 0,
        nonce: balanceInfo.nonce
      }, {
        address: transferInfo.fromAddress,
        assetsChainId: 2,
        assetsId: 1,
        amount: newFee,
        locked: 0,
        nonce: mainNetBalanceInfo.nonce
      }];
      let mainNetOutputs = [{
        address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: transferInfo.amount,
        lockTime: 0
      }];
      mainCtx.setCoinData(mainNetInputs, mainNetOutputs);
    }
    //如果手续费发生改变，重新组装CoinData
    if (transferInfo.fee !== newFee) {
      transferInfo.fee = newFee;
      inOrOutputs = await ctxInputsOrOutputs(transferInfo, balanceInfo);
      if (!inOrOutputs.success) {
        console.log(inOrOutputs.data);
        return
      }
      if (!isMainNet(chainId)) {
        inOrOutputs.data.inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: 2,
          assetsId: 1,
          amount: newFee,
          locked: 0,
          nonce: mainNetBalanceInfo.nonce
        });
      }
      tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 10);
      ctxSign = nuls.transactionSignature(pri, tAssemble);
    } else {
      ctxSign = nuls.transactionSignature(pri, tAssemble);
    }
    bw.writeBytesWithLength(pubHex);
    bw.writeBytesWithLength(ctxSign);
  } else {
    console.log("交易组装失败！");
    console.log(inOrOutputs.data);
    return;
  }
  if (!isMainNet()) {
    mainCtx.txData = tAssemble.getHash();
    mainCtxSign = nuls.transactionSignature(pri, mainCtx);
    bw.writeBytesWithLength(pubHex);
    bw.writeBytesWithLength(mainCtxSign);
  }
  tAssemble.signatures = bw.getBufWriter().toBuffer();
  let txHex = tAssemble.txSerialize().toString('hex');
  console.log(txHex);
  let result = await validateTx(txHex);
  console.log(result);
  if (result.success) {
    console.log(result.data.value);
    let results = await broadcastTx(txHex);
    if (results && results.value) {
      console.log("交易完成")
    } else {
      console.log("广播交易失败")
    }
  } else {
    console.log("验证交易失败:" + result.error)
  }
}

//调用
transferTransaction(pri, pub, fromAddress, toAddress, 100, 100, 1, amount, remark);

