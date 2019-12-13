const sdk = require('../api/sdk');
var secp256k1 = require("secp256k1");

//验证签名是否正确

let account = {
        pri:
            '5968bbe187f97d78ea93413b083acbecdba1db61e3beb3f0c5e10238fe2dbf5f',
        pub:
            '04b0358da1571511fb24d078746db64de1c90ec64db9840142b5680201ca80d747970eb8d4e9c2c6e1611704a441e002feddc7074ca5b630ef22259a9d7cc862b0',
        address: 'XXXcA7kaimujixnBjjya8BLkPuKPijSv5yxpJ'
    }
;

let hashHex = "5ea8974bc3ad29a9af9035be47d3e6a4a5b505935658ff4234c60d795313b524";

let signVal = sdk.signature(hashHex, account.pri);

let publickey = secp256k1.publicKeyConvert(Buffer.from(account.pub, "hex"), false);

let result1 = sdk.verifySign(hashHex, signVal, publickey.toString('hex'));
console.log(result1)
console.log(account.pri.length)


var testSig = function () {
    let hash = '63a1802f22fd9b7bd9663317649f57af2dd7a2f1deee82e4d6028d62cdbd57b5';
    let pri = '00db591ead0fd6a43dbff1d8e996288572f92563117c81548d4e3428a5fa503af2';

    let signVal = sdk.signature(hashHex, pri);
    let pub = sdk.getPub(pri);

    let result = {
        "pubkey": pub,
        "signData": signVal
    };
    console.log(result);
}
testSig();