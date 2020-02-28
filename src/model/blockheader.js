const sdk = require("../api/sdk")

var BlockHeader = function (bufferReader) {
    if (!bufferReader) {
        return;
    }
    this.preHash = bufferReader.slice(32);
    this.merkleHash = bufferReader.slice(32);
    this.createTime = bufferReader.readUInt32LE();
    this.height = bufferReader.readUInt32LE();
    this.txCount = bufferReader.readUInt32LE();
    this.extend = bufferReader.readBytesByLength();
    this.publicKey = bufferReader.readBytesByLength()
    this.packer = sdk.getStringAddress(1, null, this.publicKey.toString('hex'))
    this.signature = bufferReader.readBytesByLength();
}

BlockHeader.prototype.printInfo = function () {
    console.log('preHash   :: ' + this.preHash.toString("hex"));
    console.log('merkleHash:: ' + this.merkleHash.toString("hex"));
    console.log('createTime:: ' + this.createTime);
    console.log('height    :: ' + this.height);
    console.log('txCount   :: ' + this.txCount);
    console.log('extend    :: ' + this.extend.toString("hex"));
    console.log('publicKey :: ' + this.publicKey.toString('hex'))
    console.log('packer    :: ' + this.packer);
    console.log('signature :: ' + this.signature.toString('hex'));
}

module.exports = BlockHeader;