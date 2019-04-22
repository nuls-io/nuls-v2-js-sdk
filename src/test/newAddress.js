const nuls = require('../index');

let passWord = '123456asd';//密码为空 私钥会返回
const newAddress = nuls.newAddress(2, passWord);
console.log(newAddress);
