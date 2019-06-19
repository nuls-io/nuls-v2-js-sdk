const randomBytes = require('randombytes');
const BigInteger = require('bigi');
const ecurve = require('ecurve');
const CryptoJS = require('crypto-js');
const sha256 = require('sha256');
const rs = require('jsrsasign');
const bs58 = require('bs58');
const cryptos = require("crypto");
const iv = CryptoJS.enc.Hex.parse('0000000000000000');

const bufferUtils = require("../utils/buffer");


const Hash = require("../utils/hash");

//将数字转为6个字节的字节数组
function toUInt16LE(value) {
    let buf = Buffer.alloc(2);
    buf.writeInt16LE(value, 0);
    return buf;
}

module.exports = {
    //生成公私钥对
    newEcKey: function () {
        let keys = {};
        let randombytes = randomBytes(32);
        randombytes[0] = randombytes[0] >> 1;
        let privateKey = bufferUtils.bufferToHex(Buffer.from(randombytes, 'hex'));
        keys['pri'] = privateKey;
        keys['pub'] = this.getPub(privateKey);
        return keys;
    },

    //获取公钥
    getPub: function (randombytes) {
        let privateKey = Buffer.from(randombytes, 'hex');
        let ecparams = ecurve.getCurveByName('secp256k1');
        let curvePt = ecparams.G.multiply(BigInteger.fromBuffer(privateKey));
        let publicKey = curvePt.getEncoded(true);
        return publicKey.toString('hex');
    },

    //根据公钥或者私钥获取地址字符串
    getStringAddress: function (pri, pub) {
        if (!pub) {
            pub = this.getPub(pri)
        }
        let pubBuffer = Buffer.from(pub, 'hex');
        let sha = cryptos.createHash('sha256').update(pubBuffer).digest();
        let pubkeyHash = cryptos.createHash('rmd160').update(sha).digest();
        let addrBuffer = Buffer.concat([Buffer.from([0xFF & 8964 >> 0]), Buffer.from([0xFF & 8964 >> 8]), Buffer.from([1]), pubkeyHash]);
        let xor = 0x00;
        let temp = "";
        let tempBuffer = Buffer.allocUnsafe(addrBuffer.length + 1);
        for (let i = 0; i < addrBuffer.length; i++) {
            temp = addrBuffer[i];
            temp = temp > 127 ? temp - 256 : temp;
            tempBuffer[i] = temp;
            xor ^= temp
        }
        tempBuffer[addrBuffer.length] = xor;
        return bs58.encode(tempBuffer)
    },

    //aes 加密
    encrypteByAES: function (value, password) {
        let key = CryptoJS.enc.Hex.parse(sha256(password));
        let srcs = CryptoJS.enc.Hex.parse(value);
        let encrypted = CryptoJS.AES.encrypt(srcs, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.ciphertext.toString().toLowerCase();
    },

    decrypteOfAES: function (encryptedValue, password) {
        let key = CryptoJS.enc.Hex.parse(sha256(password));
        let encryptedHexStr = CryptoJS.enc.Hex.parse(encryptedValue);
        let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
        let decrypt = CryptoJS.AES.decrypt(srcs, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypt.toString().toLowerCase();
    },

    signature: function (dataHex, priHex) {
        let ec = new rs.KJUR.crypto.ECDSA({'curve': 'secp256k1'});
        return ec.signHex(dataHex, priHex);
    },

    signatureTx: function (tx, pubHex, priHex) {
        let pub = Buffer.from(pubHex, 'hex');
        let signValue = Buffer.from(this.signature(bufferUtils.bufferToHex(tx.hash.subarray(1)), priHex), 'hex');
        tx.p2PHKSignatures = [{'pub': pub, signValue: signValue}];
    },

    verifySign: function (dataHex, signHex, pubHex) {
        //todo 有问题，不能正确验证
        let ec = new rs.KJUR.crypto.ECDSA({'curve': 'secp256k1'});
        return ec.verifyHex(dataHex, signHex, pubHex);
    },

    getSha256Hex: function (seriHex) {
        let sha256 = cryptos.createHash('SHA256');
        let data = Buffer.from(seriHex, 'hex');
        sha256.update(data);
        return sha256.digest('hex');
    },

    getSha256TiwceBuf: function (buf) {
        return Hash.sha256sha256(buf);
    },

    getOwner: function (txHash, fromIndex) {
        let buf = toUInt16LE(fromIndex);
        return txHash + buf.toString("hex");
    },

    getTxHash: function (transaction) {
        let bytes = transaction.serializeForHash();
        let hash = this.getSha256TiwceBuf(bytes);
        transaction.hash = Buffer.concat([Buffer.from([0x00]), hash], hash.length + 1);
        return transaction.hash;
    },

};
