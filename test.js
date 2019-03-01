const nuls = require('./index.js');
// 创建地址
/*let newAddress = nuls.newAddress('nuls123456');
console.log(newAddress);*/

//key:2de32308846652eeeaf68e23ef586aecb82f0459d4b520dddf13c7542c2b8f83
//pub:02a4859a56aa2d4277b1f8a9243a764d9adf8ad5965b772c9278afbed8be059e6b
//pri:02ecb18a38f396e911a5077794dac1e2d53da326a3d91b2247240ff84a40e0bf701bc8257f0d174b55f920c8a70a73f8
//address:Nsdtr9G1PpZMyi7G2TafXoHYUfBkaFKz
//导入地址
const key ="2de32308846652eeeaf68e23ef586aecb82f0459d4b520dddf13c7542c2b8f83";
let getAddressByPri = nuls.importByKey(key);
console.log(getAddressByPri);

//交易序列化

//获取UTXO

//交易签名

//广播交易
