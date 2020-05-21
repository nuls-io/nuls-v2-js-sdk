const Serializers = require("../api/serializers");
const BufferReader = require("../utils/bufferreader");
const TxSignatures = require("./signatures")
const CoinData = require("./coindata")
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

let typeMap = {
  1: "共识奖励",
  2: "转账交易",
  3: "设置别名",
  4: "创建节点",
  5: "参与共识",
  6: "退出共识",
  7: "黄牌惩罚",
  8: "红牌惩罚",
  9: "注销节点",
  10: "跨链转账",
  11: "注册链",
  12: "注销链",
  13: "增加跨链资产",
  14: "注销跨链资产",
  15: "部署合约",
  16: "调用合约",
  17: "删除合约",
  18: "合约内部转账",
  19: "合约退费",
  20: "合约创建节点",
  21: "合约参与共识",
  22: "合约退出共识",
  23: "合约注销节点",
  24: "验证人变更",
  25: "验证人初始化",
  26: "合约转账",
  27: "链内资产注册"
}
/**
 * 所有交易的基础类
 * @constructor
 */
let Transaction = function () {
  this.hash = null;
  this.type = 0;//交易类型
  let times = (new Date()).valueOf();
  this.time = Number(times.toString().substr(0, times.toString().length - 3)); //交易时间
  this.remark = null;//备注
  this.txData = null;//业务数据
  this.coinData = [];//输入输出
  this.signatures = [];//签名列表

  this.parse = function (bufferReader) {
    this.type = bufferReader.readUInt16LE();
    this.time = bufferReader.readUInt32LE();
    this.remark = bufferReader.readBytesByLength();
    this.txData = bufferReader.readBytesByLength();
    this.coinData = bufferReader.readBytesByLength();
    this.signatures = bufferReader.readBytesByLength();
  };

  this.printInfo = function () {

    console.log("  {");
    console.log("      type : " + this.type + "(" + typeMap[this.type] + "),");
    console.log("      time : " + this.time + "(" + new Date(this.time * 1000).toLocaleString() + ")")
    console.log("    remark : " + this.remark.toString())
    console.log("    txData : " + this.getTxDataStr());

    var signatures = new TxSignatures(new BufferReader(this.signatures, 0));
    console.log("signatures :" + signatures.getPrintInfo());
    var coinData = new CoinData(new BufferReader(this.coinData, 0));
    console.log("  coinData : " + coinData.getPrintInfo());
    console.log(" }");
  };
  this.getTxDataStr = function () {
    if (!this.txData || 0 == this.txData.length) {
      return "--";
    }
    return this.txData.toString('hex');
  };

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
          bw.getBufWriter().write(Buffer.from("ffffffffffffffff", "hex"));
        } else if (output.lockTime === -2) {
          bw.getBufWriter().write(Buffer.from("feffffffffffffff", "hex"));
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
  Transaction,
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
  StopAgentTransaction: function (agentHash, lockTime) {
    Transaction.call(this);
    if (!agentHash) {
      throw "Data wrong!";
    }
    this.type = 9;
    this.time = lockTime;
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
  RegisterChainAndAssetTransaction: function (txDataInfo) {
    Transaction.call(this);
    if (!txDataInfo.address || !txDataInfo.chainInfo || !txDataInfo.chainInfo.chainId || !txDataInfo.chainInfo.chainName || !txDataInfo.chainInfo.addressType ||
      !txDataInfo.chainInfo.magicNumber || !txDataInfo.chainInfo.addressPrefix || !txDataInfo.chainInfo.supportInflowAsset || !txDataInfo.chainInfo.minAvailableNodeNum
      || !txDataInfo.chainInfo.verifierList || txDataInfo.chainInfo.verifierList.length < 1 || !txDataInfo.chainInfo.signatureBFTRatio || txDataInfo.chainInfo.signatureBFTRatio < 66 || txDataInfo.chainInfo.signatureBFTRatio > 100
      || !txDataInfo.chainInfo.maxSignatureCount || !txDataInfo.assetInfo.assetId || !txDataInfo.assetInfo.symbol || txDataInfo.assetInfo.symbol.length > 8
    ) {
      throw "Params wrong!";
    }
    this.type = 11;
    let bw = new Serializers();

    // stream.writeString(name);
    bw.writeString(txDataInfo.chainInfo.chainName);
    // stream.writeString(addressType);
    bw.writeString(txDataInfo.chainInfo.addressType);
    // stream.writeString(addressPrefix);
    bw.writeString(txDataInfo.chainInfo.addressPrefix);
    // stream.writeUint32(magicNumber);
    bw.getBufWriter().writeUInt32LE(txDataInfo.chainInfo.magicNumber);
    // stream.writeBoolean(supportInflowAsset);
    bw.writeBoolean(txDataInfo.chainInfo.supportInflowAsset);
    // stream.writeUint32(minAvailableNodeNum);
    bw.getBufWriter().writeUInt32LE(txDataInfo.chainInfo.minAvailableNodeNum);
    // stream.writeUint16(verifierList.size());
    bw.getBufWriter().writeUInt16LE(txDataInfo.chainInfo.verifierList.length);
    // for (String verifier : verifierList) {
    //     stream.writeString(verifier);
    // }
    for (let i = 0; i < txDataInfo.chainInfo.verifierList.length; i++) {
      bw.writeString(txDataInfo.chainInfo.verifierList[i]);
    }
    // stream.writeUint16(signatureByzantineRatio);
    bw.getBufWriter().writeUInt16LE(txDataInfo.chainInfo.signatureBFTRatio);
    // stream.writeUint16(maxSignatureCount);
    bw.getBufWriter().writeUInt16LE(txDataInfo.chainInfo.maxSignatureCount);
    // stream.writeUint16(chainId);
    bw.getBufWriter().writeUInt16LE(txDataInfo.chainInfo.chainId);
    // stream.writeUint16(assetId);
    bw.getBufWriter().writeUInt16LE(txDataInfo.assetInfo.assetId);
    // stream.writeString(symbol);
    bw.writeString(txDataInfo.assetInfo.symbol);
    // stream.writeString(name);
    bw.writeString(txDataInfo.assetInfo.assetName);
    // stream.writeBigInteger(depositNuls);
    bw.writeBigInt(80000000000);
    // stream.writeBigInteger(destroyNuls);
    bw.writeBigInt(60000000000);
    // stream.writeBigInteger(initNumber);
    bw.writeBigInt(txDataInfo.assetInfo.initNumber);
    // stream.writeShort(decimalPlaces);
    bw.getBufWriter().writeUInt16LE(txDataInfo.assetInfo.decimalPlaces);
    // stream.writeBytesWithLength(address);
    bw.writeBytesWithLength(sdk.getBytesAddress(txDataInfo.address));

    this.txData = bw.getBufWriter().toBuffer();
  },
  /**
   * 创建合约交易
   * @param contractCreate
   * @constructor
   */
  CreateContractTransaction: function (contractCreate) {
    Transaction.call(this);
    if (!contractCreate.chainId || !contractCreate.sender || !contractCreate.contractAddress ||
      !contractCreate.contractCode || !contractCreate.alias || !contractCreate.gasLimit || !contractCreate.price) {
      throw "Data wrong!";
    }

    this.type = 15;
    let bw = new Serializers();
    bw.getBufWriter().write(sdk.getBytesAddress(contractCreate.sender));
    bw.getBufWriter().write(sdk.getBytesAddress(contractCreate.contractAddress));
    bw.writeBytesWithLength(Buffer.from(contractCreate.contractCode, 'hex'));
    bw.writeString(contractCreate.alias);
    bw.writeUInt64LE(contractCreate.gasLimit);
    bw.writeUInt64LE(contractCreate.price);
    let args = contractCreate.args;
    if (args != null) {
      bw.getBufWriter().writeUInt8(args.length);
      let innerArgs;
      for (let j = 0; j < args.length; j++) {
        innerArgs = args[j];
        if (innerArgs == null) {
          bw.getBufWriter().writeUInt8(0);
        } else {
          bw.getBufWriter().writeUInt8(innerArgs.length);
          for (let k = 0; k < innerArgs.length; k++) {
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
    if (args != null) {
      bw.getBufWriter().writeUInt8(args.length);
      let innerArgs;
      for (let j = 0; j < args.length; j++) {
        innerArgs = args[j];
        if (innerArgs == null) {
          bw.getBufWriter().writeUInt8(0);
        } else {
          bw.getBufWriter().writeUInt8(innerArgs.length);
          for (let k = 0; k < innerArgs.length; k++) {
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

  CoinTradingTransaction: function (coinTrading) {
    Transaction.call(this);
    this.type = 228;
    let bw = new Serializers();
    bw.getBufWriter().writeUInt16LE(coinTrading.baseAssetChainId);
    bw.getBufWriter().writeUInt16LE(coinTrading.baseAssetId);
    bw.getBufWriter().writeUInt8(coinTrading.baseMinDecimal);
    bw.writeBigInt(coinTrading.baseMinSize);

    bw.getBufWriter().writeUInt16LE(coinTrading.quoteAssetChainId);
    bw.getBufWriter().writeUInt16LE(coinTrading.quoteAssetId);
    bw.getBufWriter().writeUInt8(coinTrading.quoteMinDecimal);
    bw.writeBigInt(coinTrading.quoteMinSize);

    this.txData = bw.getBufWriter().toBuffer();
  },

  //dex 交易对添加委托
  TradingOrderTransaction: function (tradingOrder) {
    Transaction.call(this);
    this.type = 229;
    let bw = new Serializers();
    let hash = Buffer.from(tradingOrder.tradingHash, 'hex');
    bw.getBufWriter().write(hash);
    bw.getBufWriter().write(sdk.getBytesAddress(tradingOrder.address));
    bw.getBufWriter().writeUInt8(tradingOrder.orderType);
    bw.writeBigInt(tradingOrder.amount);
    bw.writeBigInt(tradingOrder.price);
    bw.writeBytesWithLength(sdk.getBytesAddress(tradingOrder.feeAddress));
    bw.getBufWriter().writeUInt8(tradingOrder.feeScale);
    this.txData = bw.getBufWriter().toBuffer();
  },

  //dex 交易对撤销委托
  CancelTradingOrderTransaction: function (tradingOrder) {
    Transaction.call(this);
    this.type = 230;
    let bw = new Serializers();
    let hash = Buffer.from(tradingOrder.orderHash, 'hex');
    bw.getBufWriter().write(hash);
    this.txData = bw.getBufWriter().toBuffer();
  },
};

