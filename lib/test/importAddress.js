'use strict';

var nuls = require('../index');

/**
 * @disc: 导入地址 dome
 * @date: 2019-10-18 10:36
 * @author: Wave
 */

var passWord = '';
var key = "ddddb7cb859a467fbe05d5034735de9e62ad06db6557b64d7c139b6db856b200";
try {
  var importAddress = nuls.importByKey(2, key, passWord, "tNULS");
  console.log(importAddress);
  console.log(importAddress.address === 'tNULSeBaMuBCG7NkSyufjE76CVbPQMrZ5Q1v3s');
} catch (err) {
  console.log(err);
}