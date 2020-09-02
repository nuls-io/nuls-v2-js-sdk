const nuls = require('../index');
const sdk = require('../api/sdk');


const prikeyhex = "c10e00458e0d78b22739ef162a7c5cfc739a3425228a9ee06af97f452fa0b53d7f69c544e7a6bc63a60b0cda01245a0a";



let result = nuls.decrypteOfAES(prikeyhex,"jian1021!@#$")


console.log(result)


console.log(nuls.getAddressByPub(9,1,sdk.getPub(result),"NERVE"))