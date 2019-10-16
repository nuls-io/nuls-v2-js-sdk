const nuls = require('../index');
let passWord = 'nuls123456';//密码为空 私钥会返回
const newAddress = nuls.newAddress(100, passWord, 'XXX');
console.log(newAddress);
let result = nuls.verifyAddress(newAddress.address);
console.log(result);

//1.0与2.0私钥或公钥生成的地址是否相同
/*let rest = nuls.addressEquals("TTarYnUfsftmm7DrStandCEdd4SNiELS", "tNULSeBaMoG1oaW1JZnh6Ly65Ttp6raeTFBfCG");
console.log(rest);*/
