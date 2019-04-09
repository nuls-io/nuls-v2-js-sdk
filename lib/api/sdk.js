'use strict';

var randomBytes = require('randombytes');
var BigInteger = require('bigi');
var ecurve = require('ecurve');
var CryptoJS = require('crypto-js');
var sha256 = require('sha256');
var rs = require('jsrsasign');
var bs58 = require('bs58');
var cryptos = require("crypto");
var iv = CryptoJS.enc.Hex.parse('0000000000000000');

var bufferUtils = require("../utils/buffer");

var Hash = require("../utils/hash");

//将数字转为6个字节的字节数组
function toUInt16LE(value) {
    var buf = Buffer.alloc(2);
    buf.writeInt16LE(value, 0);
    return buf;
}

module.exports = {
    //生成公私钥对
    newEcKey: function newEcKey() {
        var keys = {};
        var randombytes = randomBytes(32);
        randombytes[0] = randombytes[0] >> 1;
        var privateKey = bufferUtils.bufferToHex(Buffer.from(randombytes, 'hex'));
        keys['pri'] = privateKey;
        keys['pub'] = this.getPub(privateKey);
        return keys;
    },

    //获取公钥
    getPub: function getPub(randombytes) {
        var privateKey = Buffer.from(randombytes, 'hex');
        var ecparams = ecurve.getCurveByName('secp256k1');
        var curvePt = ecparams.G.multiply(BigInteger.fromBuffer(privateKey));
        var publicKey = curvePt.getEncoded(true);
        return publicKey.toString('hex');
    },

    //根据公钥或者私钥获取地址字符串
    getStringAddress: function getStringAddress(chainId, pri, pub) {
        if (!pub) {
            pub = this.getPub(pri);
        }
        var pubBuffer = Buffer.from(pub, 'hex');
        var sha = cryptos.createHash('sha256').update(pubBuffer).digest();
        var pubkeyHash = cryptos.createHash('rmd160').update(sha).digest();
        var chainIdBuffer = Buffer.concat([Buffer.from([0xFF & chainId >> 0]), Buffer.from([0xFF & chainId >> 8])]);
        var addrBuffer = Buffer.concat([chainIdBuffer, Buffer.from([1]), pubkeyHash]);
        var xor = 0x00;
        var temp = "";
        var tempBuffer = Buffer.allocUnsafe(addrBuffer.length + 1);
        for (var i = 0; i < addrBuffer.length; i++) {
            temp = addrBuffer[i];
            temp = temp > 127 ? temp - 256 : temp;
            tempBuffer[i] = temp;
            xor ^= temp;
        }
        tempBuffer[addrBuffer.length] = xor;
        var prefix = '';
        if (1 == chainId) {
            prefix = 'NULS';
        } else if (2 == chainId) {
            prefix = "tNULS";
        } else {
            prefix = bs58.encode(chainIdBuffer).toUpperCase();
        }
        var constant = ['a', 'b', 'c', 'd', 'e'];
        return prefix + constant[prefix.length - 1] + bs58.encode(tempBuffer);
    },

    //aes 加密
    encrypteByAES: function encrypteByAES(value, password) {
        var key = CryptoJS.enc.Hex.parse(sha256(password));
        var srcs = CryptoJS.enc.Hex.parse(value);
        var encrypted = CryptoJS.AES.encrypt(srcs, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.ciphertext.toString().toLowerCase();
    },

    decrypteOfAES: function decrypteOfAES(encryptedValue, password) {
        var key = CryptoJS.enc.Hex.parse(sha256(password));
        var encryptedHexStr = CryptoJS.enc.Hex.parse(encryptedValue);
        var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
        var decrypt = CryptoJS.AES.decrypt(srcs, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypt.toString().toLowerCase();
    },

    signature: function signature(dataHex, priHex) {
        var ec = new rs.KJUR.crypto.ECDSA({ 'curve': 'secp256k1' });
        return ec.signHex(dataHex, priHex);
    },

    signatureTx: function signatureTx(tx, pubHex, priHex) {
        var pub = Buffer.from(pubHex, 'hex');
        var signValue = Buffer.from(this.signature(bufferUtils.bufferToHex(tx.hash.subarray(1)), priHex), 'hex');
        tx.p2PHKSignatures = [{ 'pub': pub, signValue: signValue }];
    },

    verifySign: function verifySign(dataHex, signHex, pubHex) {
        //todo 有问题，不能正确验证
        var ec = new rs.KJUR.crypto.ECDSA({ 'curve': 'secp256k1' });
        return ec.verifyHex(dataHex, signHex, pubHex);
    },

    getSha256Hex: function getSha256Hex(seriHex) {
        var sha256 = cryptos.createHash('SHA256');
        var data = Buffer.from(seriHex, 'hex');
        sha256.update(data);
        return sha256.digest('hex');
    },

    getSha256TiwceBuf: function getSha256TiwceBuf(buf) {
        return Hash.sha256sha256(buf);
    },

    getOwner: function getOwner(txHash, fromIndex) {
        var buf = toUInt16LE(fromIndex);
        return txHash + buf.toString("hex");
    },

    getTxHash: function getTxHash(transaction) {
        var bytes = transaction.serializeForHash();
        var hash = this.getSha256TiwceBuf(bytes);
        transaction.hash = Buffer.concat([Buffer.from([0x00]), hash], hash.length + 1);
        return transaction.hash;
    }

};