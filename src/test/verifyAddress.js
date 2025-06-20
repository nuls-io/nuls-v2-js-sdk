const nuls = require('../index');

/**
 * @disc: 地址验证 dome
 * @date: 2019-10-18 10:41
 * @author: Wave
 */

let address = 'NULSd6HgbjYg869gRWDLnHELGW281LkebDPbL';
console.log(nuls.verifyAddress(address));
console.log(nuls.verifyAddress('NERVEepb68k61XyjtnE9sdyi6eUhcLP2rkhdne'));
