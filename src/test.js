const nuls = require('./index');
const utils = require('./utils/utils');

//创建地址
let passWord = 'nuls123456';
// const newAddress = nuls.newAddress(2,passWord);
// console.log(newAddress);

//导入地址
const key = "411fa90f7161a20f4624a4f00167fac6d5afd97a7e6815f60e66106c559564a1";
const importAddress = nuls.importByKey(2, key, passWord);
console.log(importAddress);
console.log(importAddress.address === 'tNULSeBaMuBCG7NkSyufjE76CVbPQMrZ5Q1v3s');


/**
 * from    TTamW5GY7RXwES6JsJwA9UHqTxGKMnKw
 * to      TTakMrubBXi998CZgaYdTy2Nrqwd2ptq
 * value   0.8
 * remark  remark....
 */
let pri = '683766502db8e219936121170e2906fff6678455a3b0e9afc66bb841e661e8bd';
let pub = '0358ded06b4477272fa20a0c70418f9392af40e67ba79c705702b275a5a4d7fc5b';
let fromAddress = 'TTamW5GY7RXwES6JsJwA9UHqTxGKMnKw';
let toAddress = 'TTakMrubBXi998CZgaYdTy2Nrqwd2ptq';
let amount = 8000000;
let remark = 'remark....';
//
// //转账功能 trustUrl
async function transfer(pri, pub, fromAddress, toAddress, amount, remark) {
  const inputUtxoInfo = await nuls.getInputUtxo(fromAddress, amount);
  let inputOwner = [];
  let totalValue = 0;
  let fee = 100000;
  //判断是否零钱过多
  if (inputUtxoInfo.length >= 6000) {
    return {success: false, data: "Too much change to consume"}
  } else {
    //计算手续费 （124 + 50  * inputs.length + 38 * outputs.length + remark.bytes.length ）/1024
    fee = Math.ceil((124 + 50 * inputUtxoInfo.length + 38 * 2 + +utils.stringToByte(remark).length) / 1024) * 100000;
  }
  //计算转账金额需要的inputUtxo
  for (let item of inputUtxoInfo) {
    totalValue = totalValue + item.value;
    inputOwner.push({owner: item.owner, na: item.value, lockTime: item.lockTime});
  }
  let outputOwner = [
    {owner: toAddress, na: amount, lockTime: 0}
  ];
  //计算多余的金额并返回
  if (totalValue - amount > 0) {
    outputOwner.push({owner: fromAddress, na: totalValue - amount - fee, lockTime: 0})
  }
  let hashOrSignature = nuls.transferTransaction(pri, pub, inputOwner, outputOwner, remark);
  //验证交易
  let valiTransactions = await  nuls.valiTransaction(hashOrSignature.signature);
  //验证交易成功
  if (valiTransactions.data.success) {
    //广播交易
    const broadcastInfo = await  nuls.broadcast(hashOrSignature.signature);
    return broadcastInfo.data
  } else {
    return {success: false, data: "verify transaction failure"}
  }
}

//测试开始

transfer(pri, pub, fromAddress, toAddress, amount, remark).then((response) => {
  console.log(response)
}).catch((error) => {
  console.log(error)
});


