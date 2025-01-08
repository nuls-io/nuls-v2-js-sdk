const Serializers = require("../api/serializers");

let ProgramCreateDataEncodePacked = function () {
  this.hard = 255;
  this.sender = null;
  this.salt = null;
  this.codeHash = null;

  this.serialize = function () {
    let bw = new Serializers();
    bw.getBufWriter().writeUInt8(this.hard);
    bw.getBufWriter().write(this.sender);
    bw.writeBytesWithLength(this.salt);
    bw.writeBytesWithLength(this.codeHash);
    return bw.getBufWriter().toBuffer();
  };

  this.parse = function (bufferReader) {
    this.hard = bufferReader.readUInt8();
    this.sender = bufferReader.slice(23);
    this.salt = bufferReader.readBytesByLength();
    this.codeHash = bufferReader.readBytesByLength();
  };
};

module.exports = {
  ProgramCreateDataEncodePacked
};
