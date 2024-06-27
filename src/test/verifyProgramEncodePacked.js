const sdk = require('../api/sdk');

var sender = "tNULSeBaMoixxbUovqmzPyJ2AwYFAX2evKbuy9";
var nulsAmount = "20000000";
var tokenAmount = "0";
var assetKey = "";
var receiver = "tNULSeBaMnrs6JKrCy6TQdzYJZkMZJDng7QAsD";
function test() {
    let args = [sender, nulsAmount, tokenAmount, assetKey, receiver];
    let result = sdk.newProgramEncodePacked(args);
    console.log('result', result);
    let parseResult = sdk.parseProgramEncodePacked(result);
    console.log('parseResult', parseResult);
}
test();
