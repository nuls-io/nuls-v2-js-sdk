# Install
```bash
$ npm i nuls-sdk-js
```

# Usage
```js
const nuls = require('./index');

let chainId = 3; //链ID 1:NULS主网 2：NULS测试网 3以上其他链
let passWord = "";
let prefix = "semo"; //链前缀

//创建地址
const newAddress = nuls.newAddress(chainId, passWord, prefix);
console.log(newAddress);

//导入地址
const key ="";
const importAddress = nuls.importByKey(chainId, key, passWord,prefix);
console.log(importAddress);



