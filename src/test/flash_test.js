const Serializers = require("../api/serializers");
const BufferReader = require("../utils/bufferreader")
const txs = require("../model/txs")
const txsignatures = require("../model/txsignatures")
const nuls = require('../index');
const sdk = require("../api/sdk")




//todo 入参
var txHex = "";
//todo 入参
var prikeyHex = "";
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