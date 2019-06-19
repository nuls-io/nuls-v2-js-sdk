const sdk = require('./api/sdk');
const http = require('http');

let count = 1;

function getAddressInfo() {
    let addressInfo = sdk.newEcKey("12345678");
    let pri = addressInfo.pri;
    let pub = addressInfo.pub;
    addressInfo.address = sdk.getStringAddress(pri, pub);
    let url = 'http://127.0.0.1:6001/api/account/validate/' + addressInfo.address;
    http.get(url, function (req, res) {
        var html = '';
        req.on('data', function (data) {
            html += data;
        });
        req.on('end', function () {
            if (html !== '{"success":true,"data":{"value":true}}') {
                console.log(addressInfo.pri.toString('hex'));
                console.log(addressInfo.pub.toString('hex'))
                console.log(addressInfo.address);
                console.log("stop")
            } else {
                count++;
                console.log(count + '==' + html)
                getAddressInfo();
            }

        });
    });

}

function doit() {

    getAddressInfo();
}

doit();


