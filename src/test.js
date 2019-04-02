//import axios from 'axios'
const nuls = require('./index');
const utils = require('./utils/utils');

//创建地址
/*let passWord = '';
const newAddress = nuls.newAddress(passWord);
console.log(newAddress);*/

//key:2de32308846652eeeaf68e23ef586aecb82f0459d4b520dddf13c7542c2b8f83
//pub:02a4859a56aa2d4277b1f8a9243a764d9adf8ad5965b772c9278afbed8be059e6b
//pri:02ecb18a38f396e911a5077794dac1e2d53da326a3d91b2247240ff84a40e0bf701bc8257f0d174b55f920c8a70a73f8
//address:Nsdtr9G1PpZMyi7G2TafXoHYUfBkaFKz
//导入地址
/*const key ="407d5cd9b5d62ab633c52dfb45542622b06c05004a0314c312390a32b5d06234";
const importAddress = nuls.importByKey(key);
console.log(importAddress);*/

/**
 * from    TTaqFxuD1xc6gpixUiMVQsjMZ5fdYJ2o
 * to      TTakMrubBXi998CZgaYdTy2Nrqwd2ptq
 * value   0.8
 * remark  remark....
 */

let pri = '407d5cd9b5d62ab633c52dfb45542622b06c05004a0314c312390a32b5d06234';
let pub = '032dd7aaff8d2c3ae6597877b67f87702f44f5998b3da4459ddeb6eec8d39171c9';
let fromAddress = 'TTaqFxuD1xc6gpixUiMVQsjMZ5fdYJ2o';
let toAddress = 'TTakMrubBXi998CZgaYdTy2Nrqwd2ptq';
let amount = 80000000; //0.8 nuls 转出
let remark = 'remark....';

//转账功能 trustUrl
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
  let valiTransactions = await nuls.valiTransaction(hashOrSignature.signature);
  //验证交易成功
  if (valiTransactions.data.success) {
    //广播交易
    const broadcastInfo = await nuls.broadcast(hashOrSignature.signature);
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

