const nuls = require('../index');
let passWord = '123456asd';//密码为空 私钥会返回
const newAddress = nuls.newAddress(3, passWord, 'semo');
console.log(newAddress);
let result = nuls.verifyAddress(newAddress.address);
console.log(result);

//根据公钥获取地址
let address = nuls.getAddressByPub(100, 1, '0298f88c3cae67385ce3cbee00f78816db3e56e566b62bd0f4c5b45f205d3021c3', "semo");
console.log(address);

//1.0与2.0私钥或公钥生成的地址是否相同
let rest = nuls.addressEquals("TTarYnUfsftmm7DrStandCEdd4SNiELS", "tNULSeBaMoG1oaW1JZnh6Ly65Ttp6raeTFBfCG");
console.log(rest);
