"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.countFee = countFee;
/**
 * @disc: 使用方式：先组装交易，然后获取手续费，再把手续费增加到from中，然后对交易进行签名，请确认交易地址有足够的余额。
 * signatrueCount 签名数量、默认为1
 * @date: 2019-10-18 10:35
 * @author: Wave
 **/
function countFee(tx, signatrueCount) {
  var txSize = tx.txSerialize().length; //后面花些时间把tx.size()方法实现后，可以用size()
  txSize += signatrueCount * 110;
  return 100000 * (txSize / 1024);
}