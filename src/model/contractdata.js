const sdk = require("../api/sdk")

var ContractData = function (bufferReader) {
  this.sender = sdk.getStringAddressByBytes(bufferReader.slice(23));
  this.contractAddress = sdk.getStringAddressByBytes(bufferReader.slice(23));
  this.value = bufferReader.readBigInteger();
  this.gasLimit = bufferReader.readUInt64LE();
  this.price = bufferReader.readUInt64LE();
  this.methodName = bufferReader.readBytesByLength().toString();
  try {
    this.methodDesc = bufferReader.readBytesByLength().toString();
    this.argsCount = bufferReader.readUInt8();
    this.args = [];
    for (let i = 0; i < this.argsCount; i++) {
      let sizePerArg = bufferReader.readUInt8();
      if (sizePerArg == 0) {
        this.args.push([]);
      } else {
        let perArg = [];
        for (let k = 0; k < sizePerArg; k++) {
          perArg.push(bufferReader.readBytesByLength().toString());
        }
        this.args.push(perArg);
      }
    }
  } catch (e) {
    // console.log(e);
  }

};


ContractData.prototype.getPrintInfo = function () {
  return JSON.stringify(this);
};

module.exports = ContractData;
