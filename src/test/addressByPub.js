const nuls = require('../index');
let addressInfo = {
  pub: '02458d425e75a95688571c4cc074289a34d27c74cd284d6be316a775b363a205c3',
  address: 'tNULSeBaMiv3V2KMKbkHL8ZRgQRkP6CYUG2hia',
};
//根据公钥获取地址
let address = nuls.getAddressByPub(2, 1, addressInfo.pub, 'tNULS');
console.log(address);
console.log(address === addressInfo.address);


