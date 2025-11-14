
const call = require('./contractCall.js');
const nuls = require("../index");
nuls.customnet(101, "https://api.itac.club/jsonrpc");
require('dotenv').config();

/**
 * @disc: 调用合约dome - token授权
 * @date: 2019-10-18 10:28
 * @author: Wave
 */
// 用户私钥
const pri = process.env.tdcDeployer;
const importAddress = nuls.importByKey(nuls.chainId(), pri, '', "ITAC");
// 用户公钥
const pub = importAddress.pub;
// 用户地址
const fromAddress = importAddress.address;
console.log('fromAddress', fromAddress);
// 业务合约地址
let busContractAddress = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
// 要转入的NULS数量，如果没有请填入0，如转入200个NULS，则填入20000000000，此处填入的值要乘以10的8次幂，如200个NULS，则`value = 200 * (10 ^ 8)`
let nulsAmount = 0;
// 资产链ID
let assetChainId = nuls.chainId();
// 资产ID
let assetId = 1;
// 交易备注
let remark = 'call contract...';

let contractCall = {
    chainId: assetChainId,
    sender: fromAddress,
    contractAddress: busContractAddress,
    value: nulsAmount, //
    methodName: "batchMint",
    methodDesc: "",
    args: [
        ["NULSd6HgcRYQmVnuYC548DfNKk4ziwiujeoAH","NULSd6HgZ9KJHLicE9cXLbmXpR76fsc9AbrQs","NULSd6HgerY8aG8mMqJjTKT4qCy5QTxyoZFig","NULSd6Hgef1qWqX1ZuBYuvdB27QwUusFcusAX","NULSd6HgdHLoQ7y5sFTvX2wYJ96oG7FqAx2VQ","NULSd6HgdCEbKdGtP4AerT4L3RGtQBBMBJvTX","NULSd6HgVrGCtVwuQEGbU14dFBcQ54LUvpB2Y","NULSd6HgYX5tjdsb9KTwT2vn3Nz9T7fTmmxTu","NULSd6HgWQiduYGgyhveRMPtAPzNec3pjMagy","NULSd6HgUBCGUyx2hVgXvCUyvvwnjhwwFYG17","NULSd6HgUbHiADDskEEchkNiwc5XZTw751Wjo","NULSd6HgfGWCzrVgiw2CyvtTFbXxSEjHhRBZh","NULSd6HgdpabUifBceKexgLrip34cbft2bdov","NULSd6HgUb5zmLpemj1u76KfKN4fwrr9c6WvF","NULSd6HgWNQPd5aYPL2SdFXpNUAtxRK19t8hH","NULSd6HgathALMAxBa8LEtQUk9qTLxzDEsBgB","NULSd6HgWGtBw21wvMK9LNny5E8hEwS7n6Son","NULSd6HgadWQyBwqLoPaRWLnnBsxKqDKq15u4","NULSd6Hgi3eNyDHvAsoLhsUZSt4YSnWcVPoH1","NULSd6HgWJxAPxFGFJoDXLFpN5bgcEtj4VSsP","NULSd6HgVYSn8BX4cJxa7xnqfPEXy41KCVLuS","NULSd6Hgi7gFU1taMzSXVab9DHSYJehMJSECH","NULSd6HgjFu5AXYS5baxkSdXMy2GJn5cCiemY","NULSd6HgYL14nvqyGJFqzKVAroCcNFxZwXSHw","NULSd6HgdfvnbU2pE4j4G3nYqs5vTKZtqyWdK","NULSd6HgWFPhhVW68Xqm36NNqAZzDjVFEg57F","NULSd6HgV1PTefS5jg1FZJSvZotmWANxte4Dn","NULSd6HgUvjifxsxyjpgV6qmoKRJJ63y8i3y9","NULSd6HggwEoo1Ew2M6TzKgDZRvLBcxtpWK1E","NULSd6HgeNJpdkJ7hokdRF287KsQ7pnCFGwZb","NULSd6HgWEcHKqPgtu3R9G3weYHX29DdNLLD4","NULSd6HgbVi3XiWCcN4SnBUnktWcWc2wZFigv","NULSd6HgbGPScwTcFyrKhjncZrsGQkTc3ExEY","NULSd6HgZMXaTWRsLxnUud5aEGWRKNCND68Ux","NULSd6HgaTuzFgHV7P3qaEzD6nPGXDBxfzmen","NULSd6HgjLhEZxhz3gvSvZ3ZrdrCv2zpZFjjc","NULSd6HgjadZU1Vo4Vjoxu4VRAW1uLw1LjNn9","NULSd6HgX6X4vDUqRxhY2sRZrxqg8T9uJfpyA","NULSd6Hgh3BNbXaKwN3tdPR16crqRbiWa8wY4","NULSd6HggQ735jpeG5Km4xU1mSb4P5mQqzvBf","NULSd6Hgf1jUUjoZXRX5frgCuiJim4bTXSNmr","NULSd6HgjBBjTTKmUSot2zcTyzCY8Eayb6Rcj","NULSd6HgZYQh6XuVfLLuvWGJp6WALV6h7WSs6","NULSd6HgftH9CcmxvpuZvuZTr6xRR3yNdXFKt","NULSd6HgUaLPvYAUTwXSnDAVAo3KjUoztPu71","NULSd6HghgaUzr7wiyce8XU5pAGCZeyiUwu6m","NULSd6HgXqLy2g8n5NLiDLn9grp7YNqW9roNp","NULSd6HgWcVgsqF5t6MuYS34Su8dk4FUBBVvS","NULSd6HgUCfMwkncKf4bUbgMyYNTGpLF1smbJ","NULSd6HgWNJGF4ARZSMNQAkMhr7Zvwi1jqgXY","NULSd6Hgh4EnbewvF7W4KXD3GyojismiURdv3","NULSd6HgXj8TZXx3gGPZbizhkXj5dzddYMctq","NULSd6HgasPZADNyhLjGTmS5cZUmjHrze1USw","NULSd6Hgh8AwmP2HZxK4v3JnJGF4AyQ54ooN2","NULSd6HgZtFX4TsnbEoc5t2RuyTfRVAwLtRiD","NULSd6Hgeh4gotyiNGqahAqvhqvHjZfxg5SRc","NULSd6HgjTQGcLTPfpxybUReZGhcPW9M3nTFz","NULSd6HgfV6hn7CErqBN8oDhSRUgG9H9VP8Zn","NULSd6Hgayu7EABvT378VhGverRZerHbfGTtt","NULSd6HgfQfk3Q6b7JyUkZpYMDT5qju7BTvZX","NULSd6HgUdQKYiRaQbjjRt4ap3BkCXmS1A9a8","NULSd6Hgft2wmYwYv6BjYEpFam7BaH9fN247U","NULSd6HgUMFc4ergg8Mgo1XHe7jL3QWdzikVq","NULSd6HggGTuiTtUL5DZ3qJbd3ubaHGjDNdLY","NULSd6HghXSY5pCcXWhH3zxUSsqUq4ZjeiBMA","NULSd6HgUNRMpSnvA2wGTqqdrcqdD5GRVJJyB","NULSd6HgfKkoS7YRRZmL7ehiMMthL3RxEfUxD","NULSd6HgdK6stKmJgV9PWMmY7pWQrGSuxCjBW","NULSd6HgVum229i4osPKqDiEf4GVj12iunEas","NULSd6HggmQZsrRSvnafvaopAuZxHn8TsFrk3","NULSd6HgY4htk7hDxj7kQYkZJcMpHYW4xkcdY","NULSd6HgiYz6exi172N9LxP5jmFQHGjdJNDKo","NULSd6HgcQJtNPXLZdgri3uK6jHXiEFkgDxn8","NULSd6HgZmDKiJ4dwsiErJrGwU3sMszphUJqs","NULSd6Hgi9iK2egWPzXvmojPwnsEbfNAAFkq6","NULSd6HgeQKUxoLqMGkfYV1pK3H1H3KzoJxoG","NULSd6HgZ4KtGBtvzeDV37Sm7DAXVMLkDi4iu","NULSd6HgZESVmEAfG67aifaRyFoVBfNNohHuk","NULSd6HgYU7Lcsvr3qcKZpgaRLnuQYHi6f1mn","NULSd6HgeijyH7KFc2CVCb1PowpbA2BeBFLds","NULSd6HghKS3krQupVJ8HiT41zAujbab6Yw5q"],
        ["oAH.tdc","rQs.tdc","Fig.tdc","sAX.tdc","2VQ.tdc","vTX.tdc","B2Y.tdc","xTu.tdc","agy.tdc","G17.tdc","Wjo.tdc","BZh.tdc","dov.tdc","WvF.tdc","8hH.tdc","BgB.tdc","Son.tdc","5u4.tdc","oH1.tdc","SsP.tdc","LuS.tdc","ECH.tdc","emY.tdc","SHw.tdc","WdK.tdc","57F.tdc","4Dn.tdc","3y9.tdc","K1E.tdc","wZb.tdc","LD4.tdc","igv.tdc","xEY.tdc","8Ux.tdc","men.tdc","jjc.tdc","Nn9.tdc","pyA.tdc","wY4.tdc","vBf.tdc","Nmr.tdc","Rcj.tdc","Ss6.tdc","FKt.tdc","u71.tdc","u6m.tdc","oNp.tdc","VvS.tdc","mbJ.tdc","gXY.tdc","dv3.tdc","ctq.tdc","USw.tdc","oN2.tdc","RiD.tdc","SRc.tdc","TFz.tdc","8Zn.tdc","Ttt.tdc","vZX.tdc","9a8.tdc","47U.tdc","kVq.tdc","dLY.tdc","BMA.tdc","JyB.tdc","UxD.tdc","jBW.tdc","Eas.tdc","rk3.tdc","cdY.tdc","DKo.tdc","xn8.tdc","Jqs.tdc","kq6.tdc","xoG.tdc","4iu.tdc","Huk.tdc","1mn.tdc","Lds.tdc","w5q.tdc"],
        ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""]
    ]
};
//调用合约
call.callContract(pri, pub, fromAddress, assetChainId, assetId, contractCall, remark);
