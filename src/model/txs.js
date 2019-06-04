const Serializers = require("../api/serializers");
const sdk = require("../api/sdk");
const bs58 = require('bs58');
const bufferFrom = require('buffer-from');

/**
 *
 * @param address
 * @returns {*}
 */
function addressToBytes(address) {
  let bytes = bs58.decode(address);
  return bufferFrom(bytes.subarray(0, 23));
}

/**
 *
 * @param bytes
 * @returns {*}
 */
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

/**
 * 所有交易的基础类
 * @constructor
 */
let Transaction = function () {
  this.hash = null;
  this.type = 0;//交易类型
  this.time = Date.now()/1000;//交易时间
  this.remark = null;//备注
  this.txData = null;//业务数据
  this.coinData = [];//输入输出
  this.signatures = [];//签名列表

  this.txSerialize = function () {
    let bw = new Serializers();
    bw.getBufWriter().writeUInt16LE(this.type);
    bw.getBufWriter().writeUInt32LE(this.time);
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
    let bw = new Serializers();
    bw.getBufWriter().writeVarintNum(inputs.length);
    if (inputs.length > 0) {
      for (let i = 0; i < inputs.length; i++) {
        let input = inputs[i];
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
      for (let i = 0; i < outputs.length; i++) {
        let output = outputs[i];
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

  /**
   * 转账交易
   * @constructor
   */
  TransferTransaction: function () {
    Transaction.call(this);
    this.type = 2;
  },

  /**
   * 设置别名交易
   * @param address
   * @param alias
   * @constructor
   */
  AliasTransaction: function (address, alias) {
    Transaction.call(this);
    this.type = 3;
    let bw = new Serializers();
    bw.writeBytesWithLength(sdk.getBytesAddress(address));
    bw.writeString(alias);
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 创建节点交易
   * @param agent
   * @constructor
   */
  CreateAgentTransaction: function (agent) {
    Transaction.call(this);
    //对象属性结构
    if (!agent || !agent.agentAddress || !agent.packingAddress || !agent.rewardAddress || !agent.commissionRate || !agent.deposit) {
      throw "Data wrong!";
    }
    this.type = 4;
    let bw = new Serializers();
    bw.writeBigInt(agent.deposit);
    bw.getBufWriter().write(sdk.getBytesAddress(agent.agentAddress));
    bw.getBufWriter().write(sdk.getBytesAddress(agent.packingAddress));
    bw.getBufWriter().write(sdk.getBytesAddress(agent.rewardAddress));
    bw.getBufWriter().writeUInt8(agent.commissionRate);
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 委托节点交易
   * @param entity
   * @constructor
   */
  DepositTransaction: function (entity) {
    Transaction.call(this);
    //对象属性结构
    if (!entity || !entity.address || !entity.agentHash || !entity.deposit) {
      throw "Data Wrong!";
    }
    this.type = 5;
    let bw = new Serializers();
    bw.writeBigInt(entity.deposit);
    bw.getBufWriter().write(sdk.getBytesAddress(entity.address));
    bw.getBufWriter().write(Buffer.from(entity.agentHash, 'hex'));
    this.txData = bw.getBufWriter().toBuffer();

  },

  /**
   * 注销节点交易
   * @param agentHash
   * @constructor
   */
  StopAgentTransaction: function (agentHash) {
    Transaction.call(this);
    if (!agentHash) {
      throw "Data wrong!";
    }
    this.type = 9;
    this.txData = Buffer.from(agentHash, 'hex');
  },

  /**
   * 撤回交易
   * @param depositTxHash
   * @constructor
   */
  WithdrawTransaction: function (depositTxHash) {
    Transaction.call(this);
    if (!depositTxHash) {
      throw "Data wrong!";
    }
    this.type = 6;
    this.txData = Buffer.from(depositTxHash, 'hex');
  },

  /**
   * 创建合约交易
   * @param contractCreate
   * @constructor
   */
  CreateContractTransaction: function (contractCreate) {
    Transaction.call(this);
    if (!contractCreate.chainId || !contractCreate.sender || !contractCreate.contractAddress ||
        !contractCreate.contractCode || !contractCreate.gasLimit || !contractCreate.price) {
      throw "Data wrong!";
    }

    this.type = 15;
    let bw = new Serializers();
    bw.getBufWriter().write(sdk.getBytesAddress(contractCreate.sender));
    bw.getBufWriter().write(sdk.getBytesAddress(contractCreate.contractAddress));
    bw.writeBytesWithLength(Buffer.from(contractCreate.contractCode, 'hex'));
    bw.writeUInt64LE(contractCreate.gasLimit);
    bw.writeUInt64LE(contractCreate.price);
    let args = contractCreate.args;
    if(args != null) {
      bw.getBufWriter().writeUInt8(args.length);
      let innerArgs;
      for(let j = 0; j < args.length; j++) {
        innerArgs = args[j];
        if(innerArgs == null) {
          bw.getBufWriter().writeUInt8(0);
        } else {
          bw.getBufWriter().writeUInt8(innerArgs.length);
          for(let k = 0; k < innerArgs.length; k++) {
            bw.writeString(innerArgs[k]);
          }
        }
      }
    } else {
      bw.getBufWriter().writeUInt8(0);
    }
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 调用合约交易
   * @param contractCall
   * @constructor
   */
  CallContractTransaction: function (contractCall) {
    Transaction.call(this);
    if (!contractCall.chainId || !contractCall.sender || !contractCall.contractAddress || !contractCall.gasLimit || !contractCall.price ||
        !contractCall.methodName) {
      throw "Data wrong!";
    }

    this.type = 16;
    let bw = new Serializers();
    bw.getBufWriter().write(sdk.getBytesAddress(contractCall.sender));
    bw.getBufWriter().write(sdk.getBytesAddress(contractCall.contractAddress));
    bw.writeBigInt(contractCall.value);
    bw.writeUInt64LE(contractCall.gasLimit);
    bw.writeUInt64LE(contractCall.price);
    bw.writeString(contractCall.methodName);
    bw.writeString(contractCall.methodDesc);
    let args = contractCall.args;
    if(args != null) {
      bw.getBufWriter().writeUInt8(args.length);
      let innerArgs;
      for(let j = 0; j < args.length; j++) {
        innerArgs = args[j];
        if(innerArgs == null) {
          bw.getBufWriter().writeUInt8(0);
        } else {
          bw.getBufWriter().writeUInt8(innerArgs.length);
          for(let k = 0; k < innerArgs.length; k++) {
            bw.writeString(innerArgs[k]);
          }
        }
      }
    } else {
      bw.getBufWriter().writeUInt8(0);
    }


    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 删除合约交易
   * @param contractDelete
   * @constructor
   */
  DeleteContractTransaction: function (contractDelete) {
    Transaction.call(this);
    if (!contractDelete.chainId || !contractDelete.sender || !contractDelete.contractAddress) {
      throw "Data wrong!";
    }
    this.type = 17;
    let bw = new Serializers();
    bw.getBufWriter().write(sdk.getBytesAddress(contractDelete.sender));
    bw.getBufWriter().write(sdk.getBytesAddress(contractDelete.contractAddress));
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 跨链交易
   * @constructor
   */
  CrossChainTransaction: function () {
    Transaction.call(this);
    this.type = 10;
  },
};

