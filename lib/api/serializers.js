"use strict";

var BufferWriter = require("../utils/bufferwriter");
var BN = require("../utils/bn");
var BigInteger = require("bigi");

/**
 * 交易序列化
 * @param bufWriter
 * @constructor
 */
var Serializers = function Serializers(bufWriter) {
  if (!bufWriter) {
    bufWriter = new BufferWriter();
  }

  this.writeString = function (value) {
    if (!value || value.length === 0) {
      bufWriter.write(Buffer.from([0x00]));
      return;
    }
    var buf = Buffer.from(value, "UTF-8");
    bufWriter.writeVarintNum(buf.length);
    bufWriter.write(buf);
  };

  this.writeBytesWithLength = function (value) {
    if (!value || value.length === 0) {
      bufWriter.write(Buffer.from([0x00]));
      return;
    }
    bufWriter.writeVarintNum(value.length);
    bufWriter.write(value);
  };

  this.writeBoolean = function (value) {
    if (value) {
      bufWriter.writeUInt8(1);
    } else {
      bufWriter.writeUInt8(0);
    }
  };

  this.getBufWriter = function () {
    return bufWriter;
  };

  this.writeUInt64LE = function (value) {
    bufWriter.writeUInt64LEBN(new BN(value));
  };

  this.writeBigInt = function (value) {
    var bigInt = BigInteger('' + value);
    var buf = bigInt.toByteArray();
    if (buf.length > 32) {
      throw "data error!";
    }
    buf = buf.reverse();
    var arr2 = new Buffer(32);
    for (var i = 0; i < buf.length; i++) {
      arr2[i] = buf[i];
    }
    bufWriter.write(arr2);
  };
  this.writeDouble = function (value) {
    var buffer = new ArrayBuffer(8); // 初始化6个Byte的二进制数据缓冲区
    var dataView = new DataView(buffer);
    dataView.setFloat64(0, value, true);
    var buf = Buffer.alloc(8);
    var view = new Uint8Array(buffer);
    for (var i = 0; i < 8; i++) {
      buf[i] = view[i];
    }
    bufWriter.write(buf);
  };
};

module.exports = Serializers;