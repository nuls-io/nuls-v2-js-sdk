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


//将数字转为6个字节的字节数组
function toUInt16LE(value) {
    let buf = Buffer.alloc(2);
    buf.writeInt16LE(value, 0);
    return buf;
}

String.prototype.startWith = function (str) {
    if (str == null || str === "" || this.length === 0 || str.length > this.length) {
        return false;
    }
    if (this.substr(0, str.length) === str) {
        return true;
    } else {
        return false;
    }
    return true;
};
module.exports = {
    CONTRACT_CONSTRUCTOR : "<init>",
    CONTRACT_MAX_GASLIMIT : 10000000,
    CONTRACT_MINIMUM_PRICE : 25,

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

    getBytesAddress: function (stringAddress) {
        stringAddress = '' + stringAddress;
        if (stringAddress.startsWith('NULS')) {
            stringAddress = stringAddress.substring(5);
        } else if (stringAddress.startsWith('tNULS')) {
            stringAddress = stringAddress.substring(6);
        }
        for (let i = 0; i < stringAddress.length; i++) {
            let val = stringAddress.charAt(i);
            if (val >= 97) {
                stringAddress = stringAddress.substring(i + 1);
                break;
            }
        }
        let bytes = bs58.decode(stringAddress);
        return bytes.slice(0, bytes.length - 1);
    },

    //根据公钥、私钥获取地址字符串
    getStringAddress: function (chainId, pri, pub) {
        return getStringAddressBase(chainId, 1, pri, pub);
    },

    //根据公钥、私钥获取智能合约地址字符串
    getStringContractAddress: function (chainId) {
        let addressInfo = sdk.newEcKey();
        return getStringAddressBase(chainId, 2, addressInfo.pri, addressInfo.pub);
    },

    //根据地址类型、公钥、私钥获取地址字符串
    getStringAddressBase: function (chainId, type, pri, pub) {
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
        let prefix = '';
        if (1 === chainId) {
            prefix = 'NULS';
        } else if (2 === chainId) {
            prefix = "tNULS";
        } else {
            prefix = bs58.encode(chainIdBuffer).toUpperCase();
        }
        let constant = ['a', 'b', 'c', 'd', 'e'];
        return prefix + constant[prefix.length - 1] + bs58.encode(tempBuffer);
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

    signatureTx: function (tx, priHex,pubHex) {
        let pub = Buffer.from(pubHex, 'hex');
        let hash = tx.getHash();
        let sigHex = this.signature(hash.toString('hex'), priHex);
        let signValue = Buffer.from(sigHex, 'hex');
        let bw = new Serializers();
        bw.writeBytesWithLength(pub);
        bw.writeBytesWithLength(signValue);
        tx.signatures = bw.getBufWriter().toBuffer();
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
        transaction.hash = hash;
        return transaction.hash;
    },

};
