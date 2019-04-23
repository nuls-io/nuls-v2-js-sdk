const nuls = require('../index');
let passWord = '123456asd';
const key = "411fa90f7161a20f4624a4f00167fac6d5afd97a7e6815f60e66106c559564a1";
const importAddress = nuls.importByKey(2, key, passWord);
console.log(importAddress);
console.log(importAddress.address === 'tNULSeBaMuBCG7NkSyufjE76CVbPQMrZ5Q1v3s');
