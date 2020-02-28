let BigInteger = require("bigi");

var BufferReader = function (buffer, cursor) {
    this.buf = buffer;
    this.cursor = cursor;

}

BufferReader.prototype.getCursor = function () {
    return this.cursor;
};
BufferReader.prototype.getBuffer = function () {
    return this.buf;
};

BufferReader.prototype.slice = function (length) {
    var result = this.buf.slice(this.cursor, this.cursor + length);
    this.cursor += length;
    return result;
};

BufferReader.prototype.readUInt64LE = function () {
    var bytes = this.slice(8);
    return (bytes[0] & 0xff) |
        ((bytes[1] & 0xff) << 8) |
        ((bytes[2] & 0xff) << 16) |
        ((bytes[3] & 0xff) << 24) |
        ((bytes[4] & 0xff) << 32) |
        ((bytes[5] & 0xff) << 40) |
        ((bytes[6] & 0xff) << 48) |
        ((bytes[7] & 0xff) << 56);
};
BufferReader.prototype.readUInt32LE = function () {
    var result = this.buf.readUInt32LE(this.cursor);
    this.cursor += 4;
    return result;
};
BufferReader.prototype.readUInt16LE = function () {
    var result = this.buf.readUInt16LE(this.cursor);
    this.cursor += 2;
    return result;
};
BufferReader.prototype.readUInt8 = function () {
    var result = this.buf.readUInt8(this.cursor);
    this.cursor += 1;
    return result;
};
BufferReader.prototype.readBytesByLength = function () {
    var length = this.readVarInt();
    var result = this.slice(length);
    return result;
};
BufferReader.prototype.isFinished = function () {
    return this.buf.length == this.cursor;
};
BufferReader.prototype.readBoolean = function () {
    result = this.buf.readUInt8();
    this.cursor += 1;
    return result != 0;
};
BufferReader.prototype.readBigInteger = function () {
    var bytes = this.slice(32);
    var value = new BigInteger(bytes.reverse());
    return  value.toString();
};

BufferReader.prototype.readVarInt = function () {
    var first = 0xFF & this.buf.readInt8(this.cursor);
    var result = first;
    if (first < 253) {
        this.cursor += 1;
    } else if (first == 253) {
        result = this.buf.readInt16LE(this.cursor + 1)
        this.cursor += 3;
    } else if (first == 254) {
        result = this.buf.readUInt32LE(this.cursor + 1)
        this.cursor += 5;
    } else {
        result = this.buf.readUInt64LE(this.cursor + 1)
        this.cursor += 9;
    }
    return result;
};


module.exports = BufferReader;