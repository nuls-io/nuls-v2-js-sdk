const BlockHeader = require("./blockheader")
const txs = require("./txs")

var Block = function (bufferReader) {
    this.header = new BlockHeader(bufferReader);
    this.txList = [];
    for (var i = 0; i < this.header.txCount; i++) {
        let tx = new txs.Transaction();
        tx.parse(bufferReader);
        this.txList.push(tx);
    }
}
Block.prototype.printInfo = function () {
    console.log('header = [');
    this.header.printInfo();
    console.log(']');
    console.log('txList = [');
    for(var i=0;i<this.txList.length;i++){
        if(i>0){
            console.log(",")
        }
        this.txList[i].printInfo();
    }
    console.log(']');
}

module.exports = Block;