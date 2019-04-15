const Serializers = require("../api/serializers");
const sdk = require("../api/sdk")
const bs58 = require('bs58');
const bufferFrom = require('buffer-from');

//将数字转为6个字节的字节数组
function toUInt48LE(value) {
    let buf = Buffer.alloc(6);
    buf.writeUIntLE(value, 0, 6);
    return buf;
}

function addressToBytes(address) {
    /*let bytes = bs58.decode(address);
    return bytes.subarray(0, 23);*/

    let bytes = bs58.decode(address);
    return bufferFrom(bytes.subarray(0, 23));
}

function bytesToAddress(bytes) {
    let xor = 0x00;
    let temp = "";
    let tempBuffer = new Buffer(bytes.length + 1);
    for (let i = 0; i < bytes.length; i++) {
        temp = bytes[i];
        temp = temp > 127 ? temp - 256 : temp;
        tempBuffer[i] = temp;
        xor ^= temp
    }
    tempBuffer[bytes.length] = xor;
    return bs58.encode(tempBuffer)
}

//所有交易的基础类
let Transaction = function () {
    this.hash = null;
    this.type = 0;//交易类型
    this.time = Date.now();//交易时间
    this.remark = null;//备注
    this.txData = null;//业务数据
    this.coinData = [];//输入输出
    this.signatures = [];//签名列表

    this.txSerialize = function () {
        let bw = new Serializers();
        bw.getBufWriter().writeUInt16LE(this.type);
        bw.writeUINT48LE(this.time);
        bw.writeString(this.remark);
        bw.writeBytesWithLength(this.txData);//txData
        bw.writeBytesWithLength(this.coinData);
        bw.writeBytesWithLength(this.signatures);
        return bw.getBufWriter().toBuffer();
    };

    //序列化交易，不包含签名数据
    this.serializeForHash = function () {
        let bw = new Serializers();
        bw.getBufWriter().writeUInt16LE(this.type);
        bw.writeUINT48LE(this.time);
        bw.writeString(this.remark);
        bw.writeBytesWithLength(this.txData);
        bw.writeBytesWithLength(this.coinData);
        return bw.getBufWriter().toBuffer();
    };

    this.calcHash = function () {
        sdk.getTxHash(this);
    };
    this.setCoinData = function (inputs, outputs) {
        let bw = new Serializers();
        bw.getBufWriter().writeVarintNum(inputs.length);
        if (inputs.length > 0) {
            for (var i = 0; i < inputs.length; i++) {
                let input = inputs[i];
                bw.writeBytesWithLength(sdk.getBytesAddress(input.address));
                bw.getBufWriter().writeUInt16LE(input.assetsChainId);
                bw.getBufWriter().writeUInt16LE(input.assetsId);
                bw.writeBigInt(input.amount);
            }
        }
        bw.getBufWriter().writeVarintNum(outputs.length);
        if (outputs.length > 0) {
            for (var i = 0; i < outputs.length; i++) {
                let output = outputs[i];
                bw.writeBytesWithLength(sdk.getBytesAddress(outputs.address));
                bw.getBufWriter().writeUInt16LE(outputs.assetsChainId);
                bw.getBufWriter().writeUInt16LE(outputs.assetsId);
                bw.writeBigInt(input.amount);
                bw.getBufWriter().writeVarintNum(outputs.lockTime);
            }
        }
        this.coinData = bw.getBufWriter().toBuffer();
    };
    this.getHash = function () {
        if (this.hash) {
            return this.hash;
        }
        return this.calcHash();
    };
};

module.exports = {
    TransferTransaction: function () {
        Transaction.call(this);
        this.type = 2;
    },
    AliasTransaction: function () {
        this.type = 3;
        this.setTxData = function (address, alias) {
            //todo 设置txData的值
        }
    }
};

