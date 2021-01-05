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
var Serializers = require("./serializers");
var secp256k1 = require("secp256k1");

/**
 * 将数字转为6个字节的字节数组
 * @param value
 * @returns {*|Buffer}
 */
function toUInt16LE(value) {
    var buf = Buffer.alloc(2);
    buf.writeInt16LE(value, 0);
    return buf;
}

/**
 *
 * @param str
 * @returns {boolean}
 */
String.prototype.startWith = function (str) {
    if (str == null || str === "" || this.length === 0 || str.length > this.length) {
        return false;
    }
    if (this.substr(0, str.length) === str) {
        return true;
    } else {
        return false;
    }
};

module.exports = {
    CONTRACT_CONSTRUCTOR: "<init>",
    CONTRACT_MAX_GASLIMIT: 10000000,
    CONTRACT_MINIMUM_PRICE: 25,

    /**
     * 生成公私钥对
     * @returns {{}}
     */
    newEcKey: function newEcKey() {
        var keys = {};
        var randombytes = randomBytes(32);
        randombytes[0] = randombytes[0] >> 1;
        var privateKey = bufferUtils.bufferToHex(Buffer.from(randombytes, 'hex'));
        keys['pri'] = privateKey;
        keys['pub'] = this.getPub(privateKey);
        return keys;
    },

    /**
     * 获取公钥
     * @param randombytes
     * @returns {string}
     */
    getPub: function getPub(randombytes) {
        var privateKey = Buffer.from(randombytes, 'hex');
        var val = BigInteger.fromBuffer(privateKey);

        if (val.compareTo(BigInteger.valueOf(1)) <= 0) {
            throw "private key is wrong!";
        }
        var ecparams = ecurve.getCurveByName('secp256k1');
        var curvePt = ecparams.G.multiply(val);
        var publicKey = curvePt.getEncoded(true);
        return publicKey.toString('hex');
    },

    /**
     * 获取地址的bytes
     * @param stringAddress
     */
    getBytesAddress: function getBytesAddress(stringAddress) {
        stringAddress = '' + stringAddress;
        if (stringAddress.startsWith('NULS')) {
            stringAddress = stringAddress.substring(5);
        } else if (stringAddress.startsWith('tNULS')) {
            stringAddress = stringAddress.substring(6);
        } else {
            for (var i = 0; i < stringAddress.length; i++) {
                var val = stringAddress.charAt(i);
                if (val.charCodeAt(0) >= 97) {
                    stringAddress = stringAddress.substring(i + 1);
                    break;
                }
            }
        }
        var bytes = bs58.decode(stringAddress);
        return bytes.slice(0, bytes.length - 1);
    },
    /**
     * 根据byte[] 获取 地址字符串
     * @param stringAddress
     */
    getStringAddressByBytes: function getStringAddressByBytes(bytes) {
        var chainId = bytes[0] & 0xff | (bytes[1] & 0xff) << 8;
        var tempBuffer = Buffer.allocUnsafe(bytes.length + 1);
        var xor = 0x00;
        var temp = "";
        for (var i = 0; i < bytes.length; i++) {
            temp = bytes[i];
            temp = temp > 127 ? temp - 256 : temp;
            tempBuffer[i] = temp;
            xor ^= temp;
        }
        tempBuffer[bytes.length] = xor;

        if (1 === chainId) {
            prefix = 'NULS';
        } else if (2 === chainId) {
            prefix = "tNULS";
        } else if (prefix) {
            prefix = prefix.toUpperCase();
        } else {
            prefix = bs58.encode(chainIdBuffer).toUpperCase();
        }
        var constant = ['a', 'b', 'c', 'd', 'e'];
        return prefix + constant[prefix.length - 1] + bs58.encode(tempBuffer);
    },

    /**
     * 验证地址
     * @param stringAddress
     * @returns {{}}
     */
    verifyAddress: function verifyAddress(stringAddress) {
        var result = {};
        stringAddress = '' + stringAddress;
        if (stringAddress.startsWith('NULS')) {
            stringAddress = stringAddress.substring(5);
        } else if (stringAddress.startsWith('tNULS')) {
            stringAddress = stringAddress.substring(6);
        } else {
            for (var i = 0; i < stringAddress.length; i++) {
                var val = stringAddress.charAt(i);
                if (val.charCodeAt(0) >= 97) {
                    stringAddress = stringAddress.substring(i + 1);
                    break;
                }
            }
        }
        var bytes = bs58.decode(stringAddress);
        result.chainId = bytes.readInt16LE(0);
        result.type = bytes.readInt8(2);
        var temp = '';
        var xor = 0x00;
        for (var _i = 0; _i < bytes.length - 1; _i++) {
            temp = bytes[_i];
            temp = temp > 127 ? temp - 256 : temp;
            bytes[_i] = temp;
            xor ^= temp;
        }
        if (xor < 0) {
            xor = 256 + xor;
        }
        result.right = xor === bytes[bytes.length - 1];
        return result;
    },

    /**
     * 根据公钥、私钥获取地址字符串
     * @param chainId
     * @param pri
     * @param pub
     * @param prefix
     * @returns {*}
     */
    getStringAddress: function getStringAddress(chainId, pri, pub, prefix) {
        return this.getStringAddressBase(chainId, 1, pri, pub, prefix);
    },

    /**
     * 根据公钥、私钥获取智能合约地址字符串
     * @param chainId
     * @returns {*}
     */
    getStringContractAddress: function getStringContractAddress(chainId) {
        var addressInfo = this.newEcKey();
        return this.getStringAddressBase(chainId, 2, addressInfo.pri, addressInfo.pub);
    },

    /**
     * 根据地址类型、公钥、私钥获取地址字符串
     * @param chainId
     * @param type
     * @param pri
     * @param pub
     * @param prefix
     * @returns {string}
     */
    getStringAddressBase: function getStringAddressBase(chainId, type, pri, pub, prefix) {
        if (!pub) {
            pub = this.getPub(pri);
        }

        var pubBuffer = Buffer.from(pub, 'hex');
        var val = BigInteger.fromBuffer(pubBuffer);
        if (val.compareTo(BigInteger.valueOf(1)) <= 0) {
            throw "public key is wrong!";
        }

        var sha = cryptos.createHash('sha256').update(pubBuffer).digest();
        var pubkeyHash = cryptos.createHash('ripemd160').update(sha).digest();
        var chainIdBuffer = Buffer.concat([Buffer.from([0xFF & chainId >> 0]), Buffer.from([0xFF & chainId >> 8])]);
        var addrBuffer = Buffer.concat([chainIdBuffer, Buffer.from([type]), pubkeyHash]);
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

        if (1 === chainId) {
            prefix = 'NULS';
        } else if (2 === chainId) {
            prefix = "tNULS";
        } else if (prefix) {
            prefix = prefix.toUpperCase();
        } else {
            prefix = bs58.encode(chainIdBuffer).toUpperCase();
        }
        var constant = ['a', 'b', 'c', 'd', 'e'];
        return prefix + constant[prefix.length - 1] + bs58.encode(tempBuffer);
    },

    addressV1ToV2: function addressV1ToV2(addressV1, chainId) {
        if (!addressV1) {
            return;
        }
        var bytesV1 = bs58.decode(addressV1);
        var pubkeyHash = Buffer.alloc(20);
        bytesV1.copy(pubkeyHash, 0, 3, 23);
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
        var prefix = 'NULS';
        if (1 === chainId) {
            prefix = 'NULS';
        } else if (2 === chainId) {
            prefix = "tNULS";
        }
        var constant = ['a', 'b', 'c', 'd', 'e'];
        return prefix + constant[prefix.length - 1] + bs58.encode(tempBuffer);
    },

    /**
     * AES 加密
     * @param value
     * @param password
     * @returns {string}
     */
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

    /**
     * AES 解密
     * @param encryptedValue
     * @param password
     * @returns {string}
     */
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

    /**
     * 签名
     * @param dataHex
     * @param priHex
     * @returns {void|*}
     */
    signature: function signature(dataHex, priHex) {
        var ec = new rs.KJUR.crypto.ECDSA({ 'curve': 'secp256k1' });
        return ec.signHex(dataHex, priHex);
    },

    /**
     * 签名 tx
     * @param tx
     * @param priHex
     * @param pubHex
     */
    signatureTx: function signatureTx(tx, priHex, pubHex) {
        var pub = Buffer.from(pubHex, 'hex');
        var hash = tx.getHash();
        var sigHex = this.signature(hash.toString('hex'), priHex);
        var signValue = Buffer.from(sigHex, 'hex');
        var bw = new Serializers();
        bw.writeBytesWithLength(pub);
        bw.writeBytesWithLength(signValue);
        tx.signatures = bw.getBufWriter().toBuffer();
    },

    /**
     * @disc: hash 私钥签名
     * @params: hashHex, priHex
     * @date: 2019-12-03 16:59
     * @author: Wave
     */
    getSignData: function getSignData(hashHex, priHex) {
        var pub = this.getPub(priHex);
        var sigHex = this.signature(hashHex, priHex);
        return { "pub": pub.toString('hex'), "signValue": sigHex };
    },

    /**
     * App签名，拼接公钥
     * @param signValue
     * @param pubHex
     */
    appSplicingPub: function appSplicingPub(signValue, pubHex) {
        var bw = new Serializers();
        bw.writeBytesWithLength(Buffer.from(pubHex, 'hex'));
        bw.writeBytesWithLength(Buffer.from(signValue, 'hex'));
        return bw.getBufWriter().toBuffer();
    },

    /**
     * 签名 tx
     * @param tx
     * @param priHex
     */
    signatureTransaction: function signatureTransaction(tx, priHex) {
        var hash = tx.getHash();
        var sigHex = this.signature(hash.toString('hex'), priHex);
        return Buffer.from(sigHex, 'hex');
    },

    /**
     * 验证签名
     * @param dataHex
     * @param signHex
     * @param pubHex
     * @returns {*}
     */
    verifySign: function verifySign(dataHex, signHex, pubHex) {
        var ec = new rs.KJUR.crypto.ECDSA({ 'curve': 'secp256k1' });
        var publicKey = secp256k1.publicKeyConvert(Buffer.from(pubHex, "hex"), false).toString("hex");
        return ec.verifyHex(dataHex, signHex, publicKey);
    },

    /**
     * 获取hex根据sha256
     * @param seriHex
     * @returns {*|void|PromiseLike<ArrayBuffer>}
     */
    getSha256Hex: function getSha256Hex(seriHex) {
        var sha256 = cryptos.createHash('SHA256');
        var data = Buffer.from(seriHex, 'hex');
        sha256.update(data);
        return sha256.digest('hex');
    },

    /**
     * sha256转buf
     * @param buf
     * @returns {*}
     */
    getSha256TwiceBuf: function getSha256TwiceBuf(buf) {
        return Hash.sha256sha256(buf);
    },

    /**
     * 获取owner
     * @param txHash
     * @param fromIndex
     * @returns {string}
     */
    getOwner: function getOwner(txHash, fromIndex) {
        var buf = toUInt16LE(fromIndex);
        return txHash + buf.toString("hex");
    },

    /**
     * 获取txhash
     * @param transaction
     * @returns {*}
     */
    getTxHash: function getTxHash(transaction) {
        var bytes = transaction.serializeForHash();
        transaction.hash = this.getSha256TwiceBuf(bytes);
        return transaction.hash;
    },

    addressEquals: function addressEquals(addressV1, addressV2) {
        var bytesV1 = bs58.decode(addressV1);
        bytesV1 = bytesV1.slice(2, bytesV1.length - 1);
        var bytesV2 = this.getBytesAddress(addressV2);
        bytesV2 = bytesV2.slice(2, bytesV2.length);
        return bytesV1.equals(bytesV2);
    },

    getVarIntLength: function getVarIntLength(varInt) {
        if (varInt < 0) {
            return 9;
        }
        if (varInt < 253) {
            return 1;
        }
        if (varInt <= 0xFFFF) {
            return 3;
        }
        if (varInt <= 0xFFFFFFFF) {
            return 5;
        }
        return 9;
    },
    bufferReadBytesByLength: function bufferReadBytesByLength(buffer, cursor) {}

};