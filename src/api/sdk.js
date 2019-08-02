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
const Serializers = require("./serializers");

/**
 * 将数字转为6个字节的字节数组
 * @param value
 * @returns {*|Buffer}
 */
function toUInt16LE(value) {
    let buf = Buffer.alloc(2);
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
    newEcKey: function () {
        let keys = {};
        let randombytes = randomBytes(32);
        randombytes[0] = randombytes[0] >> 1;
        let privateKey = bufferUtils.bufferToHex(Buffer.from(randombytes, 'hex'));
        keys['pri'] = privateKey;
        keys['pub'] = this.getPub(privateKey);
        return keys;
    },

    /**
     * 获取公钥
     * @param randombytes
     * @returns {string}
     */
    getPub: function (randombytes) {
        let privateKey = Buffer.from(randombytes, 'hex');
        let ecparams = ecurve.getCurveByName('secp256k1');
        let curvePt = ecparams.G.multiply(BigInteger.fromBuffer(privateKey));
        let publicKey = curvePt.getEncoded(true);
        return publicKey.toString('hex');
    },

    /**
     * 获取地址的bytes
     * @param stringAddress
     */
    getBytesAddress: function (stringAddress) {
        stringAddress = '' + stringAddress;
        if (stringAddress.startsWith('NULS')) {
            stringAddress = stringAddress.substring(5);
        } else if (stringAddress.startsWith('tNULS')) {
            stringAddress = stringAddress.substring(6);
        } else {
            for (let i = 0; i < stringAddress.length; i++) {
                let val = stringAddress.charAt(i);
                if (val.charCodeAt(0) >= 97) {
                    stringAddress = stringAddress.substring(i + 1);
                    break;
                }
            }
        }
        let bytes = bs58.decode(stringAddress);
        return bytes.slice(0, bytes.length - 1);
    },

    /**
     * 验证地址
     * @param stringAddress
     * @returns {{}}
     */
    verifyAddress: function (stringAddress) {
        let result = {};
        stringAddress = '' + stringAddress;
        if (stringAddress.startsWith('NULS')) {
            stringAddress = stringAddress.substring(5);
        } else if (stringAddress.startsWith('tNULS')) {
            stringAddress = stringAddress.substring(6);
        } else {
            for (let i = 0; i < stringAddress.length; i++) {
                let val = stringAddress.charAt(i);
                if (val.charCodeAt(0) >= 97) {
                    stringAddress = stringAddress.substring(i + 1);
                    break;
                }
            }
        }
        let bytes = bs58.decode(stringAddress);
        result.chainId = bytes.readInt16LE(0);
        result.type = bytes.readInt8(2);
        let temp = '';
        let xor = 0x00;
        for (let i = 0; i < bytes.length - 1; i++) {
            temp = bytes[i];
            temp = temp > 127 ? temp - 256 : temp;
            bytes[i] = temp;
            xor ^= temp
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
    getStringAddress: function (chainId, pri, pub, prefix) {
        return this.getStringAddressBase(chainId, 1, pri, pub, prefix);
    },

    /**
     * 根据公钥、私钥获取智能合约地址字符串
     * @param chainId
     * @returns {*}
     */
    getStringContractAddress: function (chainId) {
        let addressInfo = this.newEcKey();
        return this.getStringAddressBase(chainId, 2, addressInfo.pri, addressInfo.pub);
    },

    /**
     * 根据地址类型、公钥、私钥获取地址字符串
     * @param chainId
     * @param type
     * @param pri
     * @param pub
     * @returns {string}
     */
    getStringAddressBase: function (chainId, type, pri, pub, prefix) {
        if (!pub) {
            pub = this.getPub(pri)
        }
        let pubBuffer = Buffer.from(pub, 'hex');
        let sha = cryptos.createHash('sha256').update(pubBuffer).digest();
        let pubkeyHash = cryptos.createHash('ripemd160').update(sha).digest();
        let chainIdBuffer = Buffer.concat([Buffer.from([0xFF & chainId >> 0]), Buffer.from([0xFF & chainId >> 8])]);
        let addrBuffer = Buffer.concat([chainIdBuffer, Buffer.from([type]), pubkeyHash]);
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

        if (1 === chainId) {
            prefix = 'NULS';
        } else if (2 === chainId) {
            prefix = "tNULS";
        } else if (prefix) {
            prefix = prefix.toUpperCase();
        } else {
            prefix = bs58.encode(chainIdBuffer).toUpperCase();
        }
        let constant = ['a', 'b', 'c', 'd', 'e'];
        return prefix + constant[prefix.length - 1] + bs58.encode(tempBuffer);
    },

    /**
     * AES 加密
     * @param value
     * @param password
     * @returns {string}
     */
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

    /**
     * AES 解密
     * @param encryptedValue
     * @param password
     * @returns {string}
     */
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

    /**
     * 签名
     * @param dataHex
     * @param priHex
     * @returns {void|*}
     */
    signature: function (dataHex, priHex) {
        let ec = new rs.KJUR.crypto.ECDSA({'curve': 'secp256k1'});
        return ec.signHex(dataHex, priHex);
    },

    /**
     * 签名 tx
     * @param tx
     * @param priHex
     * @param pubHex
     */
    signatureTx: function (tx, priHex, pubHex) {
        let pub = Buffer.from(pubHex, 'hex');
        let hash = tx.getHash();
        let sigHex = this.signature(hash.toString('hex'), priHex);
        let signValue = Buffer.from(sigHex, 'hex');
        let bw = new Serializers();
        bw.writeBytesWithLength(pub);
        bw.writeBytesWithLength(signValue);
        tx.signatures = bw.getBufWriter().toBuffer();
    },

    /**
     * 签名 tx
     * @param tx
     * @param priHex
     */
    signatureTransaction: function (tx, priHex) {
        let hash = tx.getHash();
        let sigHex = this.signature(hash.toString('hex'), priHex);
        return Buffer.from(sigHex, 'hex');
    },

    /**
     * 验证签名
     * @param dataHex
     * @param signHex
     * @param pubHex
     * @returns {*}
     */
    verifySign: function (dataHex, signHex, pubHex) {
        //todo 有问题，不能正确验证
        let ec = new rs.KJUR.crypto.ECDSA({'curve': 'secp256k1'});
        return ec.verifyHex(dataHex, signHex, pubHex);
    },

    /**
     * 获取hex根据sha256
     * @param seriHex
     * @returns {*|void|PromiseLike<ArrayBuffer>}
     */
    getSha256Hex: function (seriHex) {
        let sha256 = cryptos.createHash('SHA256');
        let data = Buffer.from(seriHex, 'hex');
        sha256.update(data);
        return sha256.digest('hex');
    },

    /**
     * sha256转buf
     * @param buf
     * @returns {*}
     */
    getSha256TiwceBuf: function (buf) {
        return Hash.sha256sha256(buf);
    },

    /**
     * 获取owner
     * @param txHash
     * @param fromIndex
     * @returns {string}
     */
    getOwner: function (txHash, fromIndex) {
        let buf = toUInt16LE(fromIndex);
        return txHash + buf.toString("hex");
    },

    /**
     * 获取txhash
     * @param transaction
     * @returns {*}
     */
    getTxHash: function (transaction) {
        let bytes = transaction.serializeForHash();
        transaction.hash = this.getSha256TiwceBuf(bytes);
        return transaction.hash;
    },

};
