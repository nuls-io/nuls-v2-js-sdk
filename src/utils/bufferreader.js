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
    var result = this.buf.readUInt64LE(this.cursor);
    this.cursor += 8;
    return result;
}
BufferReader.prototype.readUInt32LE = function () {
    var result = this.buf.readUInt32LE(this.cursor);
    this.cursor += 4;
    return result;
}
BufferReader.prototype.readUInt16LE = function () {
    var result = this.buf.readUInt16LE(this.cursor);
    this.cursor += 2;
    return result;
}
BufferReader.prototype.readBytesByLength = function () {
    var length = this.readVarInt();
    var result = this.slice(length);
    return result;
}

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
}


module.exports = BufferReader;