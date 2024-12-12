const nuls = require('../index');

var txKey = "b03858bb-c265-4e2d-b383-df7a4c4a87d5";
var sender = "tNULSeBaMoixxbUovqmzPyJ2AwYFAX2evKbuy9";
var nulsAmount = "20000000";
var tokenAmount = "0";
var assetKey = "";
var receiver = "tNULSeBaMnrs6JKrCy6TQdzYJZkMZJDng7QAsD";

function testEncode() {
    let args = [txKey, sender, nulsAmount, tokenAmount, assetKey, receiver];
    let result = nuls.programEncodePacked(args);
    console.log('result', result);
}

function testDecode() {
    let args = [txKey, sender, nulsAmount, tokenAmount, assetKey, receiver];
    let result = nuls.programEncodePacked(args);
    let parseResult = nuls.parseProgramEncodePacked(result);
    console.log('parseResult', parseResult);
}
testEncode();

const Signature = require('elliptic/lib/elliptic/ec/signature');
const signature = {
    r: 'bb09696750985b79948be8ec8f975aa2078ff74dbae1eb3a8dd3ec5673d68856',
    s: '502696adf22e6143aac3b3c9fd0c49c6a2210aaa3f8143c9b10b90194477d88d'
};

// 创建 Signature 对象
const sigObj = new Signature(signature);

// 转换为 DER 格式
const derSignature = sigObj.toDER();

// 输出 DER 格式化的签名
console.log('DER-formatted signature:', Buffer.from(derSignature).toString('hex'));

