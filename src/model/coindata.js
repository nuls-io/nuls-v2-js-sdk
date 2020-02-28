const sdk = require("../api/sdk")
var CoinData = function (bufferReader) {
    this.fromList = [];
    this.toList = [];
    var fromCount = bufferReader.readVarInt();
    for (var i = 0; i < fromCount; i++) {
        this.fromList.push(new CoinFrom(bufferReader));
    }
    var toCount = bufferReader.readVarInt();
    for (var i = 0; i < toCount; i++) {
        this.toList.push(new CoinTo(bufferReader));
    }
};
var CoinFrom = function (bufferReader) {
    this.address = bufferReader.readBytesByLength();
    this.assetsChainId = bufferReader.readUInt16LE();
    this.assetsId = bufferReader.readUInt16LE();
    this.amount = bufferReader.readBigInteger();
    this.nonce = bufferReader.readBytesByLength();
    this.locked = bufferReader.readBoolean();
};
var CoinTo = function (bufferReader) {
    this.address = bufferReader.readBytesByLength();
    this.assetsChainId = bufferReader.readUInt16LE();
    this.assetsId = bufferReader.readUInt16LE();
    this.amount = bufferReader.readBigInteger();
    this.lockTime = bufferReader.readUInt64LE();
};


CoinData.prototype.getPrintInfo = function () {
    var result = "{\n      fromList: [";
    for (var i = 0; i < this.fromList.length; i++) {
        if (i > 0) {
            result += ",";
        }
        result += this.fromList[i].getPrintInfo();

    }
    result += "]\n";
    result += "     toList : [";
    for (var i = 0; i < this.toList.length; i++) {
        if (i > 0) {
            result += ",";
        }
        result += this.toList[i].getPrintInfo();
    }
    result += "]\n     }";
    return result;
};

CoinFrom.prototype.getPrintInfo = function () {
    var result = "{\n";
    result += "      address : " + sdk.getStringAddressByBytes(this.address) + ',\n';
    result += "assetsChainId : " + this.assetsChainId + '\n';
    result += "     assetsId : " + this.assetsId + '\n';
    result += "       amount : " + this.amount + '\n';
    result += "        nonce : " + this.nonce.toString('hex') + '\n';
    result += "       locked : " + this.locked + '\n';
    result += "    }";
    return result;
};
CoinTo.prototype.getPrintInfo = function () {
    var result = "{\n";
    result += "      address : " + sdk.getStringAddressByBytes(this.address) + ',\n';
    result += "assetsChainId : " + this.assetsChainId + '\n';
    result += "     assetsId : " + this.assetsId + '\n';
    result += "       amount : " + this.amount + '\n';
    result += "     loctTime : " + this.lockTime + '\n';
    result += "    }";
    return result;
};
module.exports = CoinData;