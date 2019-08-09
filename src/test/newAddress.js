const nuls = require('../index');
const sdk = require('../api/sdk')
let passWord = '123456asd';//密码为空 私钥会返回
const newAddress = nuls.newAddress(8, passWord,'LIN');
console.log(newAddress);
let result = nuls.verifyAddress(newAddress.address);
console.log(result);

//根据公钥获取地址
let address = nuls.getAddressByPub(8, 1, newAddress.pub,'lin');
console.log(address);
console.log(address == newAddress.address)


let hex = sdk.getBytesAddress(address).toString('hex')
console.log(hex)


//1.0与2.0私钥或公钥生成的地址是否相同
let rest = nuls.addressEquals("TTarYnUfsftmm7DrStandCEdd4SNiELS", "tNULSeBaMoG1oaW1JZnh6Ly65Ttp6raeTFBfCG");
console.log(rest);
