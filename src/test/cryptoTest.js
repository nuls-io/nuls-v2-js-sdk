let expect = require('chai').expect;
let eccrypto = require("../crypto/eciesCrypto");

let userPrivateKey = Buffer.from("1523eb8a85e8bb6641f8ae53c429811ede7ea588c4b8933fed796c667c203c06", "hex");
let userPublicKey = eccrypto.getPublic(userPrivateKey);

describe("crypto", function () {

  it("whole encrypt success", async function () {
    let data = "Information:Modules \"nuls-base\", \"nuls-core-rockdb\", \"nuls-core-rpc\", \"nuls-base-api-provider\", \"nuls-base-protocol-update\" and 我们认为NFT的使用案例由个人拥有和交易，以及托运给第三方经纪人/钱包/拍卖商（“运营商”）。NFT可以代表对数字或实物资rebuilt due to project configuration/dependencies changes";
    let bufferData = Buffer.from(data);
    let encrypted = await eccrypto.encrypt(userPublicKey, bufferData);
    console.info("encryptd data: ", encrypted.toString("hex"));
  });

  it("whole decrypt success", async function () {
    let encrypted = Buffer.from("0451aa0e455d20a2ddeb9c4671b55738e980a615001b5c4b5bb83db94442375745a2e5eb26a6bb8f45aec6e19c617b3135f14384979ae4cf315ff352ead873534e000000000000000000000000000000008f1333c6b62b88af2f5f5bcad6712e3aa36eab3d2f01bcc9cceabd2fb1a1c353be94ae3fe5c7dd5b5c091c8228d61f39d8f252b67de04c55167e6369267b707bd805348b1d77307e523917cf94d1500bff50926169461dbfdce0a5740b7e92d187c0e2aefc45947220a69dbfb585eed565b51c477c0ae1e5a58e38902fc1fc058a481061a6c7916ebceee078f2328b1b37e4d96da8f6cae6d64ce3eb1ab58b261dcd81af4a8d488ec7267e502b97dd6de408fc12cc7bd9b70de9f20146b9122e0b817b934bfc90aa08d660705954e7e7d80f40a8fd2a8b4cdec4e6e229376b5f51f2c5f5f6c81d7b22ee5aebc0c350571ef179e46356dc9ceaaa34b65a762d934241d258a63ed9f9d98e01cd8c9a879dba2a0d2d5f147fabb5f398b975f56515ad1587655fcc592ad806e8b3abb5d00839b4ff76ff3cf5264a2beb9d4cb13382b22a3fe99700ca86ec97ab07c7e4682931bdd53669361fa62e0400e39ebc57ecafd44334de8e509cee5a2dca60ff8399f9a5511a4496ad0100f6acc2e0b85fc44c30065b7be1fd4cca58fad17caf3b4d1168fa4347ff6adf1c18169c83a8fdddfd07db26b792bca0ad990b02b42d644a3deb192afc586d87a3ead311077a5de95dc249f81133b749a548d3aeca51f06166c14d6a860061f214b18e55fa9d51e6ed00c9b2fa3272b280c1d892927bc6b1", "hex");
    let decryptd = await eccrypto.decrypt(userPrivateKey, encrypted);
    console.info("decryptd data :", decryptd.toString());
  });

});
