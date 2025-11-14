const nuls = require("../index");
nuls.customnet(101, "https://api.itac.club/jsonrpc");

const multicall = require('./contractMulticall.js');
require('dotenv').config();

async function callTest() {
    let contractAddressArray = ['ITACdAD3G9b2jtjXAXPF9UgMkSS5eGtXHkZffP','ITACdAD3G9b2jtjXAXPF9UgMkSS5eGtXHkZffP','ITACdAD3G9b2jtjXAXPF9UgMkSS5eGtXHkZffP','ITACdAD3G9b2jtjXAXPF9UgMkSS5eGtXHkZffP'];
    let methodNameArray = ["name", "symbol", "decimals", "balanceOf"];
    let argsArray = ["","","","ITACdAD3FnMJMmi2LtYTzVWDQ1DXj7LFGdoT4v"];
    console.log('nuls.chainId in test: ', nuls.chainId());
    let result = await multicall.multicall(contractAddressArray, methodNameArray, argsArray);
    console.log(result);
}

callTest();
