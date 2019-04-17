"use strict";

var Serializers = require("../api/serializers");
var sdk = require("../api/sdk");
var bs58 = require('bs58');
var bufferFrom = require('buffer-from');

//将数字转为6个字节的字节数组
function toUInt48LE(value) {
    var buf = Buffer.alloc(6);
    buf.writeUIntLE(value, 0, 6);
    return buf;
}

function addressToBytes(address) {
    /*let bytes = bs58.decode(address);
    return bytes.subarray(0, 23);*/

    var bytes = bs58.decode(address);
    return bufferFrom(bytes.subarray(0, 23));
}

function bytesToAddress(bytes) {
    var xor = 0x00;
    var temp = "";
    var tempBuffer = new Buffer(bytes.length + 1);
    for (var i = 0; i < bytes.length; i++) {
        temp = bytes[i];
        temp = temp > 127 ? temp - 256 : temp;
        tempBuffer[i] = temp;
        xor ^= temp;
    }
    tempBuffer[bytes.length] = xor;
    return bs58.encode(tempBuffer);
}

//所有交易的基础类
var Transaction = function Transaction() {
    this.hash = null;
    this.type = 0; //交易类型
    this.time = Date.now(); //交易时间
    this.remark = null; //备注
    this.txData = null; //业务数据
    this.coinData = []; //输入输出
    this.signatures = []; //签名列表

    this.txSerialize = function () {
        var bw = new Serializers();
        bw.getBufWriter().writeUInt16LE(this.type);
        bw.writeUINT48LE(this.time);
        bw.writeString(this.remark);
        bw.writeBytesWithLength(this.txData); //txData
        bw.writeBytesWithLength(this.coinData);
        bw.writeBytesWithLength(this.signatures);
        return bw.getBufWriter().toBuffer();
    };

    //序列化交易，不包含签名数据
    this.serializeForHash = function () {
        var bw = new Serializers();
        bw.getBufWriter().writeUInt16LE(this.type);
        bw.writeUINT48LE(this.time);
        bw.writeString(this.remark);
        bw.writeBytesWithLength(this.txData);
        bw.writeBytesWithLength(this.coinData);
        return bw.getBufWriter().toBuffer();
    };

    this.calcHash = function () {
        return sdk.getTxHash(this);
    };
    this.setCoinData = function (inputs, outputs) {
        var bw = new Serializers();
        bw.getBufWriter().writeVarintNum(inputs.length);
        if (inputs.length > 0) {
            for (var i = 0; i < inputs.length; i++) {
                var _input = inputs[i];
                bw.writeBytesWithLength(sdk.getBytesAddress(_input.address));
                bw.getBufWriter().writeUInt16LE(_input.assetsChainId);
                bw.getBufWriter().writeUInt16LE(_input.assetsId);
                bw.writeBigInt(_input.amount);
            }
        }
        bw.getBufWriter().writeVarintNum(outputs.length);
        if (outputs.length > 0) {
            for (var i = 0; i < outputs.length; i++) {
                var output = outputs[i];
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
    TransferTransaction: function TransferTransaction() {
        Transaction.call(this);
        this.type = 2;
    },
    AliasTransaction: function AliasTransaction(address, alias) {
        this.type = 3;
        var bw = new Serializers();
        bw.writeBytesWithLength(Buffer.from(address, 'hex'));
        bw.writeString(alias);
        this.txData = bw.getBufWriter().toBuffer();
    },
    CreateAgentTransaction: function CreateAgentTransaction(agent) {
        //对象属性结构
        if (!agent || !agent.agentAddress || !agent.packingAddress || !agent.rewardAddress || !agent.commissionRate || !agent.deposit) {
            throw "Data wrong!";
        }
        this.type = 4;
        var bw = new Serializers();
        bw.writeBigInt(agent.deposit);
        bw.getBufWriter().write(agent.agentAddress);
        bw.getBufWriter().write(agent.packingAddress);
        bw.getBufWriter().write(agent.rewardAddress);
        bw.writeDouble(agent.commissionRate);
        this.txData = bw.getBufWriter().toBuffer();
    },

    DepositTransaction: function DepositTransaction(entity) {
        //对象属性结构
        if (!entity || !entity.address || !entity.agentHash || !entity.deposit) {
            throw "Data Wrong!";
        }
        this.type = 5;
        var bw = new Serializers();
        bw.writeBigInt(entity.deposit);
        bw.getBufWriter().write(entity.address);
        bw.getBufWriter().write(entity.agentHash);
        this.txData = bw.getBufWriter().toBuffer();
    },

    StopAgentTransaction: function StopAgentTransaction(agentHash) {
        if (!agentHash) {
            throw "Data wrong!";
        }
        this.type = 9;
        this.txData = Buffer.from(agentHash, 'hex');
    },

    WithdrawTransaction: function WithdrawTransaction(depositTxHash) {
        if (!depositTxHash) {
            throw "Data wrong!";
        }
        this.type = 6;
        this.txData = Buffer.from(depositTxHash, 'hex');
    },
    CreateContractTransaction: function CreateContractTransaction() {
    }
};