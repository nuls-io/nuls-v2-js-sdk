'use strict';

var nuls = require('../index');

/**
 * @disc: 导入地址 dome
 * @date: 2019-10-18 10:36
 * @author: Wave
 */

var passWord = '123456asd';
var key = "411fa90f7161a20f4624a4f00167fac6d5afd97a7e6815f60e66106c559564a1";
var importAddress = nuls.importByKey(3, key, passWord, "help");
console.log(importAddress);
console.log(importAddress.address === 'tNULSeBaMuBCG7NkSyufjE76CVbPQMrZ5Q1v3s');