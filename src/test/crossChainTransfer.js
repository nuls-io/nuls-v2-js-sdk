const nuls = require('../index');
const txs = require('../model/txs');
const Serializers = require("../api/serializers");
const {isMainNet, countCtxFee, getBalance, broadcastTx, sendCrossTx} = require('./api/util');

/**
 * @disc: 跨链交易 dome
 * @date: 2019-10-18 10:32
 * @author: Wave
 */

let pri = 'xxx';
const importAddress = nuls.importByKey(1, pri, '', "NULS");
const pub = importAddress.pub;
let fromAddress = importAddress.address;
let toAddress = 'NERVEepb6EWVjK5zLyV3VNqKtP3A1dYhvDcNK4';
let amount = 10000000;
let remark = '跨链交易测试....';

let transferInfo = {
  fromAddress: fromAddress,
  toAddress: toAddress,
  assetsChainId: 9,
  assetsId: 1,
  amount: amount,
  remark: remark,
  fee: 1000000
};

//调用
transferTransaction(pri, pub, 1, transferInfo);

/**
 * 转账交易
 * @param pri
 * @param pub
 * @param chainId
 * @param transferInfo
 * @returns {Promise<void>}
 */
async function transferTransaction(pri, pub, chainId, transferInfo) {
  //账户转出资产余额
  //console.log(transferInfo);
  const balanceInfo = await getBalance(chainId, transferInfo.assetsChainId, transferInfo.assetsId, transferInfo.fromAddress);

  let inputs = [];
  let outputs = [{
    address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
    assetsChainId: transferInfo.assetsChainId,
    assetsId: transferInfo.assetsId,
    amount: transferInfo.amount,
    lockTime: 0
  }];

  let mainNetBalanceInfo = await getBalance(chainId, 1, 1, transferInfo.fromAddress);
  let localBalanceInfo;
  //如果不是主网需要收取NULS手续费
  if (!isMainNet(chainId)) {
    if (mainNetBalanceInfo.balance < transferInfo.fee) {
      console.log("余额不足");
      return;
    }
  }

  //如果转出资产为本链主资产，则直接将手续费加到转出金额上
  if (chainId === transferInfo.assetsChainId && transferInfo.assetsId === 1) {
    let newAmount = transferInfo.amount + transferInfo.fee;
    if (balanceInfo.balance < transferInfo.amount + transferInfo.fee) {
      console.log("余额不足");
      return;
    }
    //转出的本链资产 = 转出资产amount + 本链手续费
    inputs.push({
      address: transferInfo.fromAddress,
      assetsChainId: transferInfo.assetsChainId,
      assetsId: transferInfo.assetsId,
      amount: newAmount,
      locked: 0,
      nonce: balanceInfo.nonce
    });
    //如果不是主网需收取主网NULS手续费
    if (!isMainNet(chainId)) {
      inputs.push({
        address: transferInfo.fromAddress,
        assetsChainId: 1,
        assetsId: 1,
        amount: transferInfo.fee,
        locked: 0,
        nonce: mainNetBalanceInfo.nonce
      });
    }
  } else {
    localBalanceInfo = await getBalance(chainId, 1, 1, transferInfo.fromAddress);
    if (localBalanceInfo.balance < transferInfo.fee) {
      console.log("该账户本链主资产不足够支付手续费！");
      return;
    }
    //如果转出的是NULS，则需要把NULS手续费添加到转出金额上
    if (transferInfo.assetsChainId === 1 && transferInfo.assetsId === 1) {
      let newAmount = transferInfo.amount + transferInfo.fee;
      if (mainNetBalanceInfo.balance < newAmount) {
        console.log("余额不足");
        return;
      }
      inputs.push({
        address: transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: newAmount,
        locked: 0,
        nonce: mainNetBalanceInfo.nonce
      });
    } else {
      inputs.push({
        address: transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: transferInfo.amount,
        locked: 0,
        nonce: balanceInfo.nonce
      });
      inputs.push({
        address: transferInfo.fromAddress,
        assetsChainId: 1,
        assetsId: 1,
        amount: transferInfo.fee,
        locked: 0,
        nonce: mainNetBalanceInfo.nonce
      });
    }
    //本链主资产手续费
    if (!isMainNet(chainId)) {
      inputs.push({
        address: transferInfo.fromAddress,
        assetsChainId: chainId,
        assetsId: 1,
        amount: transferInfo.fee,
        locked: 0,
        nonce: localBalanceInfo.nonce
      });
    }
  }

  let tAssemble = await nuls.transactionAssemble(inputs, outputs, transferInfo.remark, 10);//交易组装
  let ctxSign = "";//本链协议交易签名
  let mainCtxSign = "";//主网协议交易签名
  let bw = new Serializers();
  let mainCtx = new txs.CrossChainTransaction();
  let pubHex = Buffer.from(pub, 'hex');
  let newFee = 0;
  if (isMainNet(chainId)) {
    newFee = countCtxFee(tAssemble, 1)
  } else {
    newFee = countCtxFee(tAssemble, 2);
    mainCtx.time = tAssemble.time;
    mainCtx.remark = tAssemble.remark;
    let mainNetInputs = [];
    if (transferInfo.assetsChainId === 1 && transferInfo.assetsId === 1) {
      mainNetInputs.push({
        address: transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: transferInfo.amount + newFee,
        locked: 0,
        nonce: mainNetBalanceInfo.nonce
      });
    } else {
      mainNetInputs = [{
        address: transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: transferInfo.amount,
        locked: 0,
        nonce: balanceInfo.nonce
      }, {
        address: transferInfo.fromAddress,
        assetsChainId: 1,
        assetsId: 1,
        amount: newFee,
        locked: 0,
        nonce: mainNetBalanceInfo.nonce
      }];
    }
    mainCtx.setCoinData(mainNetInputs, outputs);
  }

  //如果手续费发生改变，重新组装CoinData
  if (transferInfo.fee !== newFee) {
    if (chainId === transferInfo.assetsChainId && transferInfo.assetsId === 1) {
      if (balanceInfo.balance < transferInfo.amount + newFee) {
        console.log("余额不足");
        return;
      }
      inputs[0].amount = transferInfo.amount + newFee;
      if (!isMainNet(chainId)) {
        inputs[1].amount = newFee;
      }
    } else {
      if (localBalanceInfo.balance < transferInfo.fee) {
        console.log("该账户本链主资产不足够支付手续费！");
        return;
      }
      if (transferInfo.assetsChainId === 1 && transferInfo.assetsId === 1) {
        if (mainNetBalanceInfo.balance < transferInfo.amount + newFee) {
          console.log("余额不足");
          return;
        }
        inputs[0].amount = transferInfo.amount + newFee;
        inputs[1].amount = newFee;
      } else {
        inputs[1].amount = newFee;
        inputs[2].amount = newFee;
      }
    }
    tAssemble = await nuls.transactionAssemble(inputs, outputs, transferInfo.remark, 10);
    ctxSign = nuls.transactionSignature(pri, tAssemble);
  } else {
    ctxSign = nuls.transactionSignature(pri, tAssemble);
  }
  bw.writeBytesWithLength(pubHex);
  bw.writeBytesWithLength(ctxSign);
  if (!isMainNet(chainId)) {
    mainCtx.txData = tAssemble.getHash();
    mainCtxSign = nuls.transactionSignature(pri, mainCtx);
    bw.writeBytesWithLength(pubHex);
    bw.writeBytesWithLength(mainCtxSign);
  }
  tAssemble.signatures = bw.getBufWriter().toBuffer();
  let txHex = tAssemble.txSerialize().toString('hex');
  
  let result = await sendCrossTx(txHex);
  console.log(result);
  if (result.success) {
    console.log("交易完成")
  } else {
    console.log("广播交易失败:" + result.error)
  }
}



