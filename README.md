# 注意
nuls-sdk-js  测试网用

# Install
```bash
$ npm i nuls-sdk-js
```

# Usage
```js
const nuls = require('./index');

//创建地址
let passWord = "";
const newAddress = nuls.newAddress(passWord);
console.log(newAddress);

//导入地址
const key ="";
const importAddress = nuls.importByKey(key);
console.log(importAddress);



