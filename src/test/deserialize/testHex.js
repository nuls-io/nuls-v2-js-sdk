const nuls = require("./../../index");

const txHex = "02004e1175600433333433008c0117020001f88d93a52edc7437da5e2977d27681f0fb1e6bab02000100a029e31100000000000000000000000000000000000000000000000000000000089159a7cf6f535de8000117020001ad3482b405ca6ba6aee19b3c7db9f4a016b457770200010000a3e11100000000000000000000000000000000000000000000000000000000000000000000000000";
let hexInfo = nuls.hexParsing(txHex);
console.log(hexInfo);
