const nuls = require("./../../index");

// const txHex = "02004e1175600433333433008c0117020001f88d93a52edc7437da5e2977d27681f0fb1e6bab02000100a029e31100000000000000000000000000000000000000000000000000000000089159a7cf6f535de8000117020001ad3482b405ca6ba6aee19b3c7db9f4a016b457770200010000a3e11100000000000000000000000000000000000000000000000000000000000000000000000000";
const txHex = "0200211a7d6609636f696e2074657374008c0117020001f7ec6473df12e751d64cf20a8baa7edd50810f8102000100201d9a00000000000000000000000000000000000000000000000000000000000810c7c56b356608c7000117020001d24ac8859ded42e24659f3a953f009c908f1093e02000100809698000000000000000000000000000000000000000000000000000000000000000000000000006a2103958b790c331954ed367d37bac901de5c2f06ac8368b37d7bd6cd5ae143c1d7e3473045022008864c9df4d34fb95493348d06cecb86656055efd497f371b1cdbd146593fc21022100d941780b1bad9a54172e5a6926873ec819069efc3ed086fa45091f2293b50631";
let tx = nuls.hexParsing(txHex);
console.log(tx)
console.log(JSON.stringify(tx))

