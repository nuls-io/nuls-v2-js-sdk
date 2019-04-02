'use strict';

var Serializers = require("../api/serializers");
var bs58 = require('bs58');
var bufferFrom = require('buffer-from');

function sizeOfShort() {
  return 2;
}

function sizeOfInt32() {
  return 4;
}

function sizeOfInt48() {
  return 6;
}

function sizeOfInt64() {
  return 8;
}

function sizeOfString(val) {
  if (!val) {
    return 1;
  }
  var bytes = Buffer.from(val, "UTF-8");
  return sizeOfBytes(bytes);
}

function sizeOfBytes(bytes) {
  if (!bytes) {
    return 1;
  }
  return sizeOfVarInt(bytes.length) + bytes.length;
}

function sizeOfBytesHex(hex) {
  return sizeOfBytes(Buffer.from(hex, "hex"));
}

function sizeOfVarInt(val) {
  if (val < 0) {
    return 9;
  }
  if (val < 253) {
    return 1;
  }
  if (val <= 0xFFFF) {
    return 3;
  }
  if (val <= 0xFFFFFFFF) {
    return 5;
  }
  return 9;
}

//将数字转为6个字节的字节数组
function toUInt48LE(value) {
  var buf = Buffer.alloc(6);
  buf.writeUIntLE(value, 0, 6);
  return buf;
}

function addressToBytes(address) {
  /*let bytes = bs58.decode(address);
  return bytes.subarray(0, 23);*/

  var bytes = bs58.decode(address);
  return bufferFrom(bytes.subarray(0, 23));
}

function bytesToAddress(bytes) {
  var xor = 0x00;
  var temp = "";
  var tempBuffer = new Buffer(bytes.length + 1);
  for (var i = 0; i < bytes.length; i++) {
    temp = bytes[i];
    temp = temp > 127 ? temp - 256 : temp;
    tempBuffer[i] = temp;
    xor ^= temp;
  }
  tempBuffer[bytes.length] = xor;
  return bs58.encode(tempBuffer);
}

//所有交易的基础类
var Transaction = function Transaction() {
  this.type = 0; //交易类型
  this.time = Date.now(); //交易时间
  this.remark = null; //备注
  this.txData = null; //业务数据
  this.inputs = []; //输入
  this.outputs = []; //生成的utxo
  this.p2PHKSignatures = []; //常规签名数据
  this.scripts = []; //脚本签名
  //获取交易大小
  this.size = function () {
    var s = sizeOfShort();
    s += sizeOfInt48();
    s += sizeOfString(this.remark);
    if (this.txData) {
      s += this.getTxDataSize();
    } else {
      s += 4;
    }
    s += this.getCoinDataSize();
    s += this.getSigSize();
    return s;
  };

  this.getTxDataSize = function () {
    return 4;
  };

  //序列化utxo信息
  this.writeCoinData = function (serializer) {
    if (this.inputs.length > 0) {
      serializer.getBufWriter().writeVarintNum(this.inputs.length);
      this.inputs.forEach(function (value, index, array) {
        //对象内属性分别是交易hash(owner)、金额(na)、锁定时间(lockTime)
        serializer.writeBytesWithLength(Buffer.from(value.owner, 'hex'));
        serializer.writeUInt64LE(value.na);
        serializer.writeUINT48LE(value.lockTime);
      });
    }
    if (this.outputs.length > 0) {
      serializer.getBufWriter().writeVarintNum(this.outputs.length);
      this.outputs.forEach(function (value) {
        //对象内属性分别是地址(owner)、金额(na)、锁定时间(lockTime)
        serializer.writeBytesWithLength(addressToBytes(value.owner));
        serializer.writeUInt64LE(value.na);
        serializer.writeUINT48LE(value.lockTime);
      });
    }
  };

  //序列化签名信息
  this.writeSignatures = function (serializer) {
    if (this.p2PHKSignatures && this.p2PHKSignatures.length > 0) {
      this.p2PHKSignatures.forEach(function (value) {
        //对象内属性分别是公钥(pub)、签名类型(type)、签名数据(signValue)
        var length = 1 + value.pub.length + 1 + sizeOfVarInt(value.signValue.length) + value.signValue.length;
        serializer.getBufWriter().write(Buffer.from([length]));
        serializer.getBufWriter().write(Buffer.from([value.pub.length]));
        serializer.getBufWriter().write(value.pub);
        serializer.getBufWriter().writeUInt8(0);
        serializer.writeBytesWithLength(value.signValue);
      });
    }
    if (this.scripts && this.scripts.length > 0) {
      this.scripts.forEach(function (value) {
        //todo 脚本标识
        // serializer.getBufWriter().write([0x00, 0x00]);
        // serializer.writeBytesWithLength(value)
      });
    }
  };

  this.txSerialize = function () {
    var bw = new Serializers();
    bw.getBufWriter().writeUInt16LE(this.type);
    bw.writeUINT48LE(this.time);
    bw.writeString(this.remark);
    this.writeTxData(bw);
    this.writeCoinData(bw);
    this.writeSignatures(bw);
    return bw.getBufWriter().toBuffer();
  };

  //序列化交易，不包含签名数据
  this.serializeForHash = function () {
    var bw = new Serializers();
    bw.getBufWriter().writeUInt16LE(this.type);
    bw.writeUINT48LE(this.time);
    bw.writeString(this.remark);
    this.writeTxData(bw);
    this.writeCoinData(bw);
    return bw.getBufWriter().toBuffer();
  };

  //默认实现只写一个占位符
  this.writeTxData = function (serializer) {
    return serializer.getBufWriter().write(Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]));
  };

  //签名数据的大小
  this.getSigSize = function () {
    var s = 0;
    if (this.p2PHKSignatures.length > 0) {
      //对象内属性分别是公钥(pub)、签名类型(type)、签名数据(signValue)
      this.p2PHKSignatures.forEach(function (value) {
        s += 1;
        s += value.pub.length;
        s += 1;
        s += sizeOfBytesHex(value.signValue);
      });
    }
    if (this.scripts.length === 0) {
      this.scripts.forEach(function (value) {
        s += sizeOfBytesHex(value);
      });
    }
    return s;
  };

  //token数据的大小
  this.getCoinDataSize = function () {
    var s = sizeOfVarInt(this.inputs.length);
    if (this.inputs.length > 0) {
      this.inputs.forEach(function (value, index, array) {
        s += sizeOfBytesHex(value.owner);
        s += sizeOfInt64();
        s += sizeOfInt48();
      });
    }
    s += sizeOfVarInt(this.outputs.length);
    if (this.outputs.length > 0) {
      this.outputs.forEach(function (value) {
        s += sizeOfBytesHex(addressToBytes(value.owner));
        s += sizeOfInt64();
        s += sizeOfInt48();
      });
    }
  };

  //反序列化函数
  this.parse = function (buffer) {
    console.log("parse it .....");
  };
};

module.exports = {
  TransferTransaction: function TransferTransaction() {
    Transaction.call(this);
    this.type = 2;
    this.size = function () {
      console.log("size2");
    };
  },
  AliasTransaction: function AliasTransaction() {
    this.type = 3;
    this.address = null;
    this.alias = null;
    //重新序列化txData方法
    this.writeTxData = function (serializer) {
      if (!this.address || !this.alias) {
        throw 'Error';
      }
      serializer.getBufWriter().write(addressToBytes(this.address));
      return serializer.writeString(this.alias);
    };
    this.getTxDataSize = function () {
      return 23 + sizeOfString(this.alias);
    };
  }
};