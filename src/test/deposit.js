const nuls = require('../index');
const {getNulsBalance, countFee, inputsOrOutputs, validateTx, broadcastTx} = require('./api/util');

/**
 * @disc: 加入共识dome
 * @date: 2019-10-18 10:34
 * @author: Wave
 */

let pri = '411fa90f7161a20f4624a4f00167fac6d5afd97a7e6815f60e66106c559564a1';
let pub = '031c810153d633a5167ec629af771296bad4f26eacfe4034c978afee12b6c4fd44';
let fromAddress = "tNULSeBaMuBCG7NkSyufjE76CVbPQMrZ5Q1v3s";
let amount = 210000000000;
let remark = 'deposit ....';

let deposit = {
  address: fromAddress,
  agentHash: 'd8b31649b8d2ccac2fd258787583017f98fc1e1be579298aae650cb9698845c9',
  deposit: 2010000000000
};
//调用加入共识
doit(pri, pub, fromAddress, 2, 1, amount, deposit);

async function doit(pri, pub, fromAddress, assetsChainId, assetsId, amount, deposit) {
  const balanceInfo = await getNulsBalance(fromAddress);
  let transferInfo = {
    fromAddress: fromAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 100000
  };
  let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 5);
  let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 5, deposit);
  let txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  //console.log(txhex);
  let result = await validateTx(txhex);
  if (result) {
    console.log(result.data.value);
    let results = await broadcastTx(txhex);
    if (results && result.data.value) {
      console.log("交易完成")
    } else {
      console.log("广播交易失败")
    }
  } else {
    console.log("验证交易失败")
  }
}


