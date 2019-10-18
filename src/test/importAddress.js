const nuls = require('../index');

/**
 * @disc: 导入地址 dome
 * @date: 2019-10-18 10:36
 * @author: Wave
 */

let passWord = '123456asd';
const key = "411fa90f7161a20f4624a4f00167fac6d5afd97a7e6815f60e66106c559564a1";
const importAddress = nuls.importByKey(3, key, passWord, "help");
console.log(importAddress);
console.log(importAddress.address === 'tNULSeBaMuBCG7NkSyufjE76CVbPQMrZ5Q1v3s');
