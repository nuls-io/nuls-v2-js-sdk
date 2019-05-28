"use strict";

var Serializers = require("../api/serializers");
var sdk = require("../api/sdk");
var bs58 = require('bs58');
var bufferFrom = require('buffer-from');

function addressToBytes(address) {
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
  this.time = Date.now() / 1000; //交易时间
  this.remark = null; //备注
  this.txData = null; //业务数据
  this.coinData = []; //输入输出
  this.signatures = []; //签名列表

  this.txSerialize = function () {
    var bw = new Serializers();
    bw.getBufWriter().writeUInt16LE(this.type);
    bw.getBufWriter().writeUInt32LE(this.time);
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
    bw.getBufWriter().writeUInt32LE(this.time);
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
        var input = inputs[i];
        bw.writeBytesWithLength(sdk.getBytesAddress(input.address));
        bw.getBufWriter().writeUInt16LE(input.assetsChainId);
        bw.getBufWriter().writeUInt16LE(input.assetsId);
        bw.writeBigInt(input.amount);
        bw.writeBytesWithLength(Buffer.from(input.nonce, 'hex'));
        bw.getBufWriter().write(Buffer.from([input.locked]));
      }
    }
    bw.getBufWriter().writeVarintNum(outputs.length);
    if (outputs.length > 0) {
      for (var _i = 0; _i < outputs.length; _i++) {
        var output = outputs[_i];
        bw.writeBytesWithLength(sdk.getBytesAddress(output.address));
        bw.getBufWriter().writeUInt16LE(output.assetsChainId);
        bw.getBufWriter().writeUInt16LE(output.assetsId);
        bw.writeBigInt(output.amount);
        if (output.lockTime === -1) {
          bw.getBufWriter().write(Buffer.from("ffffffffffffffffff", "hex"));
        } else {
          bw.writeUInt64LE(output.lockTime);
        }
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
    Transaction.call(this);
    this.type = 3;
    var bw = new Serializers();
    bw.writeBytesWithLength(sdk.getBytesAddress(address));
    bw.writeString(alias);
    this.txData = bw.getBufWriter().toBuffer();
  },
  CreateAgentTransaction: function CreateAgentTransaction(agent) {
    Transaction.call(this);
    //对象属性结构
    if (!agent || !agent.agentAddress || !agent.packingAddress || !agent.rewardAddress || !agent.commissionRate || !agent.deposit) {
      throw "Data wrong!";
    }
    this.type = 4;
    var bw = new Serializers();
    bw.writeBigInt(agent.deposit);
    bw.getBufWriter().write(sdk.getBytesAddress(agent.agentAddress));
    bw.getBufWriter().write(sdk.getBytesAddress(agent.packingAddress));
    bw.getBufWriter().write(sdk.getBytesAddress(agent.rewardAddress));
    bw.getBufWriter().writeUInt8(agent.commissionRate);
    this.txData = bw.getBufWriter().toBuffer();
  },

  DepositTransaction: function DepositTransaction(entity) {
    Transaction.call(this);
    //对象属性结构
    if (!entity || !entity.address || !entity.agentHash || !entity.deposit) {
      throw "Data Wrong!";
    }
    this.type = 5;
    var bw = new Serializers();
    bw.writeBigInt(entity.deposit);
    bw.getBufWriter().write(sdk.getBytesAddress(entity.address));
    bw.getBufWriter().write(Buffer.from(entity.agentHash, 'hex'));
    this.txData = bw.getBufWriter().toBuffer();
  },

  StopAgentTransaction: function StopAgentTransaction(agentHash) {
    Transaction.call(this);
    if (!agentHash) {
      throw "Data wrong!";
    }
    this.type = 9;
    this.txData = Buffer.from(agentHash, 'hex');
  },

  WithdrawTransaction: function WithdrawTransaction(depositTxHash) {
    Transaction.call(this);
    if (!depositTxHash) {
      throw "Data wrong!";
    }
    this.type = 6;
    this.txData = Buffer.from(depositTxHash, 'hex');
  },
  CreateContractTransaction: function CreateContractTransaction(contractCreate) {
    Transaction.call(this);
    if (!contractCreate.chainId || !contractCreate.sender || !contractCreate.contractAddress || !contractCreate.contractCode || !contractCreate.gasLimit || !contractCreate.price) {
      throw "Data wrong!";
    }

    this.type = 15;
    var bw = new Serializers();
    bw.getBufWriter().write(sdk.getBytesAddress(contractCreate.sender));
    bw.getBufWriter().write(sdk.getBytesAddress(contractCreate.contractAddress));
    bw.writeBytesWithLength(Buffer.from(contractCreate.contractCode, 'hex'));
    bw.writeUInt64LE(contractCreate.gasLimit);
    bw.writeUInt64LE(contractCreate.price);
    var args = contractCreate.args;
    if (args != null) {
      bw.getBufWriter().writeUInt8(args.length);
      var innerArgs = void 0;
      for (var j = 0; j < args.length; j++) {
        innerArgs = args[j];
        if (innerArgs == null) {
          bw.getBufWriter().writeUInt8(0);
        } else {
          bw.getBufWriter().writeUInt8(innerArgs.length);
          for (var k = 0; k < innerArgs.length; k++) {
            bw.writeString(innerArgs[k]);
          }
        }
      }
    } else {
      bw.getBufWriter().writeUInt8(0);
    }
    this.txData = bw.getBufWriter().toBuffer();
  },
  CallContractTransaction: function CallContractTransaction(contractCall) {
    Transaction.call(this);
    if (!contractCall.chainId || !contractCall.sender || !contractCall.contractAddress || !contractCall.gasLimit || !contractCall.price || !contractCall.methodName) {
      throw "Data wrong!";
    }

    this.type = 16;
    var bw = new Serializers();
    bw.getBufWriter().write(sdk.getBytesAddress(contractCall.sender));
    bw.getBufWriter().write(sdk.getBytesAddress(contractCall.contractAddress));
    bw.writeBigInt(contractCall.value);
    bw.writeUInt64LE(contractCall.gasLimit);
    bw.writeUInt64LE(contractCall.price);
    bw.writeString(contractCall.methodName);
    bw.writeString(contractCall.methodDesc);
    var args = contractCall.args;
    if (args != null) {
      bw.getBufWriter().writeUInt8(args.length);
      var innerArgs = void 0;
      for (var j = 0; j < args.length; j++) {
        innerArgs = args[j];
        if (innerArgs == null) {
          bw.getBufWriter().writeUInt8(0);
        } else {
          bw.getBufWriter().writeUInt8(innerArgs.length);
          for (var k = 0; k < innerArgs.length; k++) {
            bw.writeString(innerArgs[k]);
          }
        }
      }
    } else {
      bw.getBufWriter().writeUInt8(0);
    }

    this.txData = bw.getBufWriter().toBuffer();
  },
  DeleteContractTransaction: function DeleteContractTransaction(contractDelete) {
    Transaction.call(this);
    if (!contractDelete.chainId || !contractDelete.sender || !contractDelete.contractAddress) {
      throw "Data wrong!";
    }
    this.type = 17;
    var bw = new Serializers();
    bw.getBufWriter().write(sdk.getBytesAddress(contractDelete.sender));
    bw.getBufWriter().write(sdk.getBytesAddress(contractDelete.contractAddress));
    this.txData = bw.getBufWriter().toBuffer();
  }
};