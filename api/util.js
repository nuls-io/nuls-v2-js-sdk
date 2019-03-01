//随机字节
const randomBytes = require('randombytes');
//操作大整数
const BigInteger = require('bigi');
//椭圆曲线密码
const ecurve = require('ecurve');
//密码标准
const CryptoJS = require('crypto-js');
//Sa256 字节
const sha256 = require('sha256');

const iv = CryptoJS.enc.Hex.parse('0000000000000000');

module.exports = {
  /**
   * 加密私钥
   * @param param
   * @returns {string}
   */
  encryptedPrivateKey: function (param) {
    const key = CryptoJS.enc.Hex.parse(sha256(param.pass));
    const srcs = CryptoJS.enc.Hex.parse(param.pri);
    let encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.ciphertext.toString().toLowerCase();
  },

  /**
   * 解密私钥
   * @param param
   * @returns {string}
   */
  decodePrivateKey: function (param) {
    const key = CryptoJS.enc.Hex.parse(sha256(param.pass));
    const encryptedHexStr = CryptoJS.enc.Hex.parse(param.pri);
    const srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    let decrypt = CryptoJS.AES.decrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypt.toString().toLowerCase();
  },

  /**
   * 根据私钥获取公钥
   * @param randombytes
   * @returns {string}
   */
  getPublicKeyByPrivateKey: function (randombytes) {
    let privateKey = new Buffer.from(randombytes, 'hex');
    let ecparams = ecurve.getCurveByName('secp256k1');
    let curvePt = ecparams.G.multiply(BigInteger.fromBuffer(privateKey));
    let x = curvePt.affineX.toBuffer(32);
    let y = curvePt.affineY.toBuffer(32);
    let publicKey = Buffer.concat([new Buffer.from([0x04]), x, y]);
    publicKey = curvePt.getEncoded(true);
    return publicKey.toString('hex');
  },

  /**
   * 交易签名
   * @param param
   * @returns {string}
   */
  signTrans: function (param) {
    /*参与签名的需要去掉0200*/
    let result = "";
    let hash = param.hash.substring(4, param.hash.length);
    let pri = param.pri;
    let pub = param.pub;
    //hash = new Buffer(hash,'hex');
    let ec = new rs.KJUR.crypto.ECDSA({'curve': 'secp256k1'});
    let signValue = ec.signHex(hash, pri);
    let xsize = pub.length / 2;
    xsize = xsize.toString(16);
    result += xsize;
    result += pub;
    xsize = signValue.length / 2;
    xsize = xsize.toString(16);
    result += "00";
    result += xsize;
    result += signValue;
    return result;
  },

};
