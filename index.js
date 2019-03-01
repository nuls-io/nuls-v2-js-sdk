const methods = require('./model/methods');

module.exports = {

  //生成地址
  newAddress:function (passWord) {
    return methods.newAddress(passWord);
  },


  //私钥导入
  importByKey:function (param) {
    if(param){
      //let data = methods.getPublicKeyByKey(param);
      let data = {"address":methods.getAddressByPublicKey(methods.getPublicKeyByKey(param))};
      return {"success": true, data}
    }else {
      return {"success": false, "code":"SYS003", "msg": "key error"};
    }
  },
};
