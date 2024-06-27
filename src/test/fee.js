/**
 * @disc: 使用方式：先组装交易，然后获取手续费，再把手续费增加到from中，然后对交易进行签名，请确认交易地址有足够的余额。
 * signatrueCount 签名数量、默认为1
 * @date: 2019-10-18 10:35
 * @author: Wave
 **/
export function countFee(tx, signatrueCount) {
  let txSize = tx.txSerialize().length;//后面花些时间把tx.size()方法实现后，可以用size()
  txSize += signatrueCount * 110;
  return 100000 * (txSize / 1024);
}

let a = {
  "chainId": 1,
  "assetId": 1,
  "mainChainId": 1,
  "mainAssetId": 1,
  "language": "zh-CHS",
  "encoding": "UTF-8",
  "keystoreFolder": "/keystore/backup",
  "dataPath":"/data",
  "blackHolePublicKey":"000000000000000000000000000000000000000000000000000000000000000000",
  "addressPrefix":"NULS"
};
