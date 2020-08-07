const Serializers = require("../api/serializers");
const BufferReader = require("../utils/bufferreader")
const txs = require("../model/txs")
const txsignatures = require("../model/txsignatures")
const nuls = require('../index');
const sdk = require("../api/sdk")





var txHex = "0200631a2d5f0000fd16010217050001ab7da01103b1359355cab6afc0d0550c0731c48202000100009435770000000000000000000000000000000000000000000000000000000008000000000000000000170500014c5cce4bcccb8416b0e257d3858fe53bfc13130705000100355c1d280100000000000000000000000000000000000000000000000000000008b850bb60be22655a0002170500014c5cce4bcccb8416b0e257d3858fe53bfc131307020001000094357700000000000000000000000000000000000000000000000000000000000000000000000017050001ab7da01103b1359355cab6afc0d0550c0731c4820500010095d51b280100000000000000000000000000000000000000000000000000000000000000000000006a210379d8ac3f592da1c29357d90a27984b82743386a884f2d1b1e551c4bdf6173df5473045022100b2772d085f2c61207b6c8f4c01593eec0b54b9702a6d5869ea408dea81d55d08022060d699b71a0ec7d5d3adc346774ce18a9c0da31c0c4d45b87f9ba73557852ce7";
var prikeyHex = "a572b95153b10141ff06c64818c93bd0e7b4025125b83f15a89a7189248191ca";
// 解析交易
var bufferReader = new BufferReader(Buffer.from(txHex, "hex"), 0);
// 反序列回交易对象
let tx = new txs.Transaction();
tx.parse(bufferReader);

// 初始化签名对象
let txSignData = new txsignatures.TransactionSignatures();

// 反序列化签名对象
let reader = new BufferReader(tx.signatures, 0);
txSignData.parse(reader);

// 打印已签名地址
let address = nuls.getAddressByPub(5, 1,txSignData.signatures[0].pubkey, 'TNVT');
console.log(address)

//获取本账户公钥
var pub = sdk.getPub(prikeyHex);

// 签名
let sigHex = sdk.signature(tx.getHash().toString("hex"), prikeyHex);
let signValue = Buffer.from(sigHex, 'hex');

// 追加签名到对象中
txSignData.addSign(Buffer.from(pub,"hex"),signValue)

// 追加签名到交易中
tx.signatures = txSignData.serialize();

//计算交易hash
tx.calcHash();

console.log(tx.getHash().toString("hex"))
// console.log(pub)
// console.log(signValue)
// 结果
console.log(tx.txSerialize().toString("hex"))