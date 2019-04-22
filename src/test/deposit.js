const nuls = require('../index');
const {getNulsBalance, countFee, inputsOrOutputs, validateTx, broadcastTx} = require('./api/util');

let pri = '94d344417d6faa55e3017709dd6b837bac2bc1769e3a4b516ac9a981465ac03c';
let pub = '02403cb49ac24ff9555b073ce981e28bed5e81438b2c715a14d06bd248ea1d0091';
let fromAddress = "tNULSeBaMfwpGBmn8xuKABPWUbdtsM2cMoinnn";

let amount = 210000000000;
let remark = 'niels test alias....';

//转账功能 trustUrl
async function doit(pri, pub, fromAddress, assetsChainId, assetsId, amount, deposit) {
  const balanceInfo = await getNulsBalance(fromAddress);
  let transferInfo = {
    fromAddress: fromAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: countFee()
  };
  let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 5);
  let txhex = await nuls.transactionSerialize(pri, pub, inOrOutputs.inputs, inOrOutputs.outputs, remark, 5, deposit);
  //console.log(txhex);
  let result = await validateTx(txhex);
  if (result) {
    console.log(result.value);
    let results = await broadcastTx(txhex);
    if (results && result.value) {
      console.log("交易完成")
    } else {
      console.log("广播交易失败")
    }
  } else {
    console.log("验证交易失败")
  }
}

//测试开始
let deposit = {
  address: fromAddress,
  agentHash: '716dc8c056e2ac2364d70d0994f8067fde9df172cffd0831a767419022810762',
  deposit: 210000000000
};
//调用加入共识
doit(pri, pub, fromAddress, 2, 1, amount, deposit);
