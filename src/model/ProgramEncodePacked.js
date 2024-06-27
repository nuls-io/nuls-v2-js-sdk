const Serializers = require("../api/serializers");

let ProgramEncodePacked = function () {
  this.argsCount = 0;
  this.args = null;
  this.serialize = function () {
    let bw = new Serializers();
    bw.getBufWriter().writeUInt8(this.argsCount);
    if (this.args && this.args.length > 0) {
      for (let i = 0; i < this.args.length; i++) {
        bw.writeString(this.args[i]);
      }
    }
    return bw.getBufWriter().toBuffer();
  };

  this.parse = function (bufferReader) {
    this.argsCount = bufferReader.readUInt8();
    this.args = [];
    for (let k = 0; k < this.argsCount; k++) {
      this.args.push(bufferReader.readBytesByLength().toString());
    }
  };
};

module.exports = {
  ProgramEncodePacked
};
