const nuls = require('../index');
const txs = require('../model/txs');
const Serializers = require("../api/serializers");
const {isMainNet, countCtxFee, getBalance, validateTx, broadcastTx} = require('./api/util');
/*let pri = '9ce21dad67e0f0af2599b41b515a7f7018059418bab892a7b68f283d489abc4b';//tNULSeBaMvEtDfvZuukDf2mVyfGo3DdiN8KLRG
let pub = '03958b790c331954ed367d37bac901de5c2f06ac8368b37d7bd6cd5ae143c1d7e3';
let fromAddress = "tNULSeBaMvEtDfvZuukDf2mVyfGo3DdiN8KLRG";
let toAddress = '8CPcA7kaXSHbWb3GHP7bd5hRLFu8RZv57rY9w';*/
let pri = "2b268718adc69586a38aa146987a7e365fac171b995d517cb8f166d8327bb5b1";//8CPcA7kaXSHbWb3GHP7bd5hRLFu8RZv57rY9w
let pub = '02b740f2e2ab7a219bca2a0251dffdffdc4e412f036f94443e3683cdb39f07f292';
let fromAddress = "8CPcA7kaXSHbWb3GHP7bd5hRLFu8RZv57rY9w";
let toAddress = 'tNULSeBaMvEtDfvZuukDf2mVyfGo3DdiN8KLRG';
let amount = 2000000;
let remark = '跨链交易测试....';

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
  const balanceInfo = await getBalance(chainId, assetsChainId, assetsId, fromAddress);
  let transferInfo = {
    fromAddress: fromAddress,
    toAddress: toAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 1000000
  };

  let inputs = [];
  let outputs = [{
    address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
    assetsChainId: transferInfo.assetsChainId,
    assetsId: transferInfo.assetsId,
    amount: amount,
    lockTime: 0
  }];

  let mainNetBalanceInfo;
  let localBalanceInfo;
  //如果不是主网需要收取NULS手续费
  if (!isMainNet(chainId)) {
    mainNetBalanceInfo = await getBalance(chainId, 2, 1, fromAddress);
    if (mainNetBalanceInfo.balance < transferInfo.fee) {
      console.log("余额不足");
      return;
    }
  }

  //如果转出资产为本链主资产，则直接在将手续费加到转出金额上
  if (chainId === assetsChainId && assetsId === 1) {
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
        assetsChainId: 2,
        assetsId: 1,
        amount: transferInfo.fee,
        locked: 0,
        nonce: mainNetBalanceInfo.nonce
      });
    }
  } else {
    localBalanceInfo = await getBalance(chainId, chainId, 1, fromAddress);
    if (localBalanceInfo.balance < transferInfo.fee) {
      console.log("该账户本链主资产不足够支付手续费！");
      return;
    }
    //如果转出的是NULS，则需要把NULS手续费添加到转出金额上
    if (assetsChainId === 2 && assetsId === 1) {
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
        amount: amount,
        locked: 0,
        nonce: balanceInfo.nonce
      });
      inputs.push({
        address: transferInfo.fromAddress,
        assetsChainId: 2,
        assetsId: 1,
        amount: transferInfo.fee,
        locked: 0,
        nonce: mainNetBalanceInfo.nonce
      });
    }
    //本链主资产手续费
    inputs.push({
      address: transferInfo.fromAddress,
      assetsChainId: chainId,
      assetsId: 1,
      amount: transferInfo.fee,
      locked: 0,
      nonce: localBalanceInfo.nonce
    });
  }

  let tAssemble = await nuls.transactionAssemble(inputs, outputs, remark, 10);//交易组装
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
    if (assetsChainId === 2 && assetsId === 1) {
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
        assetsChainId: 2,
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
    if (chainId === assetsChainId && assetsId === 1) {
      if (balanceInfo.balance < transferInfo.amount + newFee) {
        console.log("余额不足");
        return;
      }
      inputs[0].amount = amount + newFee;
      if (!isMainNet(chainId)) {
        inputs[1].amount = newFee;
      }
    } else {
      if (localBalanceInfo.balance < transferInfo.fee) {
        console.log("该账户本链主资产不足够支付手续费！");
        return;
      }
      if (assetsChainId === 2 && assetsId === 1) {
        if (mainNetBalanceInfo.balance < amount + newFee) {
          console.log("余额不足");
          return;
        }
        inputs[0].amount = amount + newFee;
        inputs[1].amount = newFee;
      } else {
        inputs[1].amount = newFee;
        inputs[2].amount = newFee;
      }
    }
    tAssemble = await nuls.transactionAssemble(inputs, outputs, remark, 10);
    ctxSign = nuls.transactionSignature(pri, tAssemble);
  } else {
    ctxSign = nuls.transactionSignature(pri, tAssemble);
  }
  bw.writeBytesWithLength(pubHex);
  bw.writeBytesWithLength(ctxSign);
  if (!isMainNet()) {
    mainCtx.txData = tAssemble.getHash();
    mainCtxSign = nuls.transactionSignature(pri, mainCtx);
    bw.writeBytesWithLength(pubHex);
    bw.writeBytesWithLength(mainCtxSign);
  }
  tAssemble.signatures = bw.getBufWriter().toBuffer();
  let txHex = tAssemble.txSerialize().toString('hex');
  let result = await validateTx(txHex);
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
transferTransaction(pri, pub, fromAddress, toAddress, 100, 2, 1, amount, remark);

