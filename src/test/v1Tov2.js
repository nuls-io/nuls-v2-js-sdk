const nuls = require('../api/sdk');

/**
 * @disc: 验证V1.0与V2.0地址是否相同 dome
 * @date: 2019-10-18 10:40
 * @author: Wave
 */

let addressV2 = nuls.addressV1ToV2("TTarKL8DjsoXmn2EAYTnzC5KK8oxNULS",1);
console.log(addressV2);
addressV2 = nuls.addressV1ToV2("Nsdwnd4auFisFJKU6iDvBxTdPkeg8qkB",1);
console.log(addressV2);
