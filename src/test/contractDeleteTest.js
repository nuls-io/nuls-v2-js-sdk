
const deleted = require('./contractDelete.js');

/**
 * @disc: 删除合约 dome
 * @date: 2019-10-18 10:31
 * @author: Wave
 */
let pri = '76b7beaa98db863fb680def099af872978209ed9422b7acab8ab57ad95ab218b';
let pub = '02ec9e957823cd30d809f44830442562ca5bf42530251247b35d9209690f39be67';
let fromAddress = "tNULSeBaMqywZjfSrKNQKBfuQtVxAHBQ8rB2Zn";
// 业务合约地址
let busContractAddress = "tNULSeBaNA3RADUR6CJCzxdPSevKJKDM4ULAqz";
// 资产链ID
let assetChainId = 2;
// 资产ID
let assetId = 1;
let remark = 'delete contract...';

let contractDelete = {
  chainId: 2,
  sender: fromAddress,
  contractAddress: busContractAddress
};

//合约删除
deleted.deleteContract(pri, pub, fromAddress, assetChainId, assetId, contractDelete, remark);

