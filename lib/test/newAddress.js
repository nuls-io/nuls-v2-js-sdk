'use strict';

var nuls = require('../index');

/**
 * @disc: 创建地址 dome
 * @date: 2019-10-18 10:36
 * @author: Wave
 */

var passWord = ''; //密码为空 私钥会返回
var newAddress = nuls.newAddress(100, passWord, 'XXX');
console.log(newAddress);

//验证地址
var result = nuls.verifyAddress(newAddress.address);
console.log(result);

//1.0与2.0私钥或公钥生成的地址是否相同
/*let rest = nuls.addressEquals("TTarYnUfsftmm7DrStandCEdd4SNiELS", "tNULSeBaMoG1oaW1JZnh6Ly65Ttp6raeTFBfCG");
console.log(rest);*/