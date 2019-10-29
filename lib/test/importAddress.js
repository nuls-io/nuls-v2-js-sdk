'use strict';

var nuls = require('../index');

/**
 * @disc: 导入地址 dome
 * @date: 2019-10-18 10:36
 * @author: Wave
 */

var passWord = '';
var key = "30bfde504d8ff3c269d0a0816034c3eeceb2eaa04c1f0d36ee724527b0e3a25d";
var importAddress = nuls.importByKey(100, key, passWord, "XXX");
console.log(importAddress);
console.log(importAddress.address === 'tNULSeBaMuBCG7NkSyufjE76CVbPQMrZ5Q1v3s');