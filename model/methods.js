//随机字节
const randomBytes = require('randombytes');
//Sa256 字节
const sha256 = require('sha256');
//密码库
const rs = require('jsrsasign');
//Bas64编码器
const base64 = require('base-64');
//bs58编码
const bs58 = require('bs58');

const cryptos = require("crypto");

const util = require('./../api/util');

module.exports = {

  /**
   * 创建账户地址
   * @param passWord
   * @returns {*|{success: boolean, code: number, data: *}}
   */
  newAddress: function (passWord) {
    let keys = {};
    const randombytes = randomBytes(32);
    randombytes[0] = randombytes[0] >> 1;
    const privateKey = new Buffer.from(randombytes, 'hex').toString('hex');
    //console.log(privateKey);
    keys['pub'] = util.getPublicKeyByPrivateKey(privateKey);
    if (passWord) {
      keys['pri'] = util.encryptedPrivateKey({pass: passWord, pri: privateKey});
    } else {
      keys['pri'] = privateKey;
    }
    keys['address'] = this.getAddressByPublicKey(keys.pub);
    return util.successBack(keys)
  },

  /**
   * 根据私钥获取地址
   * * @param pri
   */
  getAddressByPri:function (pri) {
    let pub = util.getPublicKeyByPrivateKey(pri);
  },

  /**
   * 根据公钥获取私钥
   * @param pri
   * @returns {*}
   */
  getPublicKeyByKey: function (pri) {
    return util.getPublicKeyByPrivateKey(pri)
  },

  /**
   * 根据公钥获取地址
   * @param pub
   * @returns {*}
   */
  getAddressByPublicKey: function (pub) {
    let pubBuffer = new Buffer.from(pub, 'hex');
    let sha = cryptos.createHash('sha256').update(pubBuffer).digest();
    let pubkeyHash = cryptos.createHash('rmd160').update(sha).digest();
    let addrBuffer = Buffer.concat([new Buffer.from([0xFF & 8964 >> 0]), new Buffer.from([0xFF & 8964 >> 8]), new Buffer.from([1]), pubkeyHash]);
    let xor = 0x00;
    let temp = 0;
    let tempBuffer = new Buffer.alloc(addrBuffer.length + 1);
    for (let i = 0; i < addrBuffer.length; i++) {
      temp = addrBuffer[i];
      temp = temp > 127 ? temp - 256 : temp;
      tempBuffer[i] = temp;
      xor ^= temp
    }
    tempBuffer[addrBuffer.length] = xor;
    return bs58.encode(tempBuffer)
  },



};
