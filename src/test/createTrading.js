const txs = require('../model/txs');
const sdk = require('../api/sdk');

// 以NVT/NULS举例


var addressHex = "TNVTdTSPVcqUCdfVYWwrbuRtZ1oM6GpSgsgF5";

let coinTrading = {}

coinTrading.address = sdk.getBytesAddress(addressHex)
coinTrading.quoteAssetChainId = 5;
coinTrading.quoteAssetId = 1;
coinTrading.scaleQuoteDecimal = 6;
coinTrading.baseAssetChainId = 2;
coinTrading.baseAssetId = 1;
coinTrading.scaleBaseDecimal = 6;
coinTrading.minBaseAmount = 10000000;
coinTrading.minQuoteAmount = 10000000;

let tx = new txs.CoinTradingTransaction(coinTrading);
console.log(tx.txData.toString("hex"))