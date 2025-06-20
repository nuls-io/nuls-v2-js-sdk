const tx = require('../model/txs');
let inputs = [];
inputs.push({
  address: 'LINcjJR16WwP7a7irS3T4p1td7QAd2MSUEqk',
  assetsChainId: 8,
  assetsId: 1,
  amount: 3300000000,
  locked: 0,
  nonce: '9673f2fdd28de29f'
});
inputs.push({
  address: 'LINcjJR16WwP7a7irS3T4p1td7QAd2MSUEqk',
  assetsChainId: 2,
  assetsId: 1,
  amount: 1000000,
  locked: 0,
  nonce: '9673f2fdd28de29f'
});
let outputs = [];
outputs.push({
  address: 'tNULSeBaMvEtDfvZuukDf2mVyfGo3DdiN8KLRG',
  assetsChainId: 8,
  assetsId: 1,
  amount: 3300000000,
  lockTime: 0
});
let temp = new tx.CrossChainTransaction();
temp.setCoinData(inputs, outputs);
console.log(temp.coinData.toString('hex'));


function validTokenNameOrSymbol(name) {
  if (!name || name.trim().length === 0) {
      return false;
  }

  let upperCaseName = name.toUpperCase();
  if (upperCaseName === "NULS") {
      return false;
  }

  let aliasBytes = Buffer.from(name, 'utf-8'); 
  if (aliasBytes.length < 1 || aliasBytes.length > 20) {
      return false;
  }

  const regex = /^[a-zA-Z0-9_]+$/;
  return regex.test(name);
}

console.log(validTokenNameOrSymbol('nUls'));
console.log(validTokenNameOrSymbol('reg aaa'));
console.log(validTokenNameOrSymbol('asdasdasd'));
console.log(validTokenNameOrSymbol('asda_sdasd'));
console.log(validTokenNameOrSymbol('_asdasdasd'));
console.log(validTokenNameOrSymbol('asdasdasd_'));
console.log(validTokenNameOrSymbol('asNULSasd'));
console.log(validTokenNameOrSymbol('asdasdasdasdasdasdasdasdasdasdasdasd'));
