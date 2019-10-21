const nuls = require('../index');

/**
 * @disc: 根据公钥获取地址
 * @date: 2019-10-18 10:27
 * @author: Wave
 */

let addressInfo = {
  pub: '02458d425e75a95688571c4cc074289a34d27c74cd284d6be316a775b363a205c3',
  address: 'tNULSeBaMiv3V2KMKbkHL8ZRgQRkP6CYUG2hia',
};
let address = nuls.getAddressByPub(2, 1, addressInfo.pub, 'tNULS');
console.log(address);
console.log(address === addressInfo.address);


