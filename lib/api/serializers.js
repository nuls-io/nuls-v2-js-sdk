"use strict";

var BufferWriter = require("../utils/bufferwriter");
var BN = require("../utils/bn");
var bi = require("big-integer")

//将数字转为6个字节的字节数组
function toUInt48LE(value) {
    var buf = Buffer.alloc(6);
    buf.writeUIntLE(value, 0, 6);
    return buf;
}

var Serializers = function Serializers(bufWriter) {
    if (!bufWriter) {
        bufWriter = new BufferWriter();
    }

    this.writeUINT48LE = function (value) {
        bufWriter.write(toUInt48LE(value));
    };

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
            bufWriter.write(1);
        } else {
            bufWriter.write(0);
        }
    };

    this.getBufWriter = function () {
        return bufWriter;
    };

    this.writeUInt64LE = function (value) {
        bufWriter.writeUInt64LEBN(new BN(value));
    };

    this.writeBigInt = function (value) {
        let buf = bigInt(value).toArray(32);
        bufWriter.write(buf);
    };
    this.writeDouble = function (value) {
        var buffer = new ArrayBuffer(8); // 初始化6个Byte的二进制数据缓冲区
        var dataView = new DataView(buffer);
        dataView.setFloat64(value);
        bufWriter.write(buffer);
    };
};

module.exports = Serializers;