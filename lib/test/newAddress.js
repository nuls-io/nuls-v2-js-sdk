'use strict';

var nuls = require('../index');
var passWord = '123456asd'; //密码为空 私钥会返回
var newAddress = nuls.newAddress(2, passWord);
console.log(newAddress);