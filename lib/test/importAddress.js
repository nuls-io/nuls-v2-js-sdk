'use strict';

var nuls = require('../index');

/**
 * @disc: 导入地址 dome
 * @date: 2019-10-18 10:36
 * @author: Wave
 */

var passWord = '';
var key = "00db591ead0fd6a43dbff1d8e996288572f92563117c81548d4e3428a5fa503af2";
try {
  var importAddress = nuls.importByKey(2, key, passWord, "tNULS");
  console.log(importAddress);
  console.log(importAddress.address === 'tNULSeBaMuBCG7NkSyufjE76CVbPQMrZ5Q1v3s');
} catch (err) {
  console.log(err);
}