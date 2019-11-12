const nuls = require('../index');
const sdk = require('../api/sdk');
const {getNulsBalance, countFee, validateTx, broadcastTx, mutiInputsOrOutputs} = require('./api/util');

/**
 * @disc:注册跨链交易
 * @date: 2019-10-17 15:50
 * @author: Wave
 */

let chain = {
  chainId: 99,
  addressType: "1",//1 使用NULS框架构建的链 生态内，2生态外"
  chainName: "test1",
  addressPrefix: "XXXX",
  magicNumber: 10066,
  supportInflowAsset: true,
  verifierList: ["XXXcA7kaeQMPaiRNPpQSEP8S8tNXDFeC5vnEy", "XXXcA7kaiK3YhCdSxfXaaffHupBDPjm3veiEE", "XXXcA7kaYY2QrRFX7Le9YdwtzQ9JvtRUU37bx"],
  minAvailableNodeNum: 3,
  maxSignatureCount: 200,
  signatureBFTRatio: 66
};
let asset = {
  assetId: 1,
  symbol: "XXX",
  assetName: "XXX",
  initNumber: 10000000000000,
  decimalPlaces: 8
};

let fromAddress = "tNULSeBaMpVdwtAD2k33tiCbEsPXhpV3E6Zvgp";
let pri = '4776e429194e9a1c0669a962df4b9f46745a19b2b6fa04e02304ce3ad54ad791';

//注册跨链交易
registerChainAndAsset(pri, fromAddress, chain, asset);

async function registerChainAndAsset(pri, address, chainInfo, assetInfo) {
  const balanceInfo = await getNulsBalance(address);
  if (!balanceInfo.nonce) {
    console.log("get balance failed!");
    return;
  }
  let pub = sdk.getPub(pri);
  //跨链交易消耗3000nuls=1600转账+800锁定+600销毁
  let transferInfo = {
    assetsChainId: 2,
    assetsId: 1,
    fee: 100000,
    from: {
      fromAddress: address,
      amount: 300000000000
    },
    to: [
      {toAddress: "tNULSeBaMpQTyMygD2DLtW8pPBxHRqjjZqfyMh", amount: 160000000000},
      {toAddress: address, amount: 80000000000, lockTime: -1},
      {
        toAddress: sdk.getStringAddress(2, null, "000000000000000000000000000000000000000000000000000000000000000000", "tNULS"),
        amount: 60000000000
      }
    ]
  };
  let inOrOutputs = await mutiInputsOrOutputs(transferInfo, balanceInfo, 11);
  let tAssemble = [];//交易组装
  let txhex = "";//交易签名
  if (inOrOutputs.success) {
    let txData = {
      address: address,
      chainInfo: chainInfo,
      assetInfo: assetInfo
    };
    tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, '', 11, txData);
    //获取手续费
    let newFee = countFee(tAssemble, 1);
    //手续费大于0.001的时候重新组装交易及签名
    if (transferInfo.fee !== newFee) {
      transferInfo.fee = newFee;
      inOrOutputs = await mutiInputsOrOutputs(transferInfo, balanceInfo, 11);
      tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, '', 11, txData);
      txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
    } else {
      txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
    }
    console.log(inOrOutputs.data.inputs);
    console.log(inOrOutputs.data.outputs);
  } else {
    console.log(inOrOutputs.data);
    return;
  }
  console.log(txhex);
  let result = await validateTx(txhex);
  console.log(result);
  if (result.success) {
    console.log(result.data.value);
    let results = await broadcastTx(txhex);
    if (results && results.value) {
      console.log("交易完成")
    } else {
      console.log("广播交易失败")
    }
  } else {
    console.log("验证交易失败:" + result.error)
  }
}


