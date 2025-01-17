
const nuls = require("../../index");
const keccak = require('keccak');

const factory = 'tNULSeBaMzYWiaCcZPu3kD2nJ52jMzMvbNzgVn';
const pairCodeHash = '39a7640b54538bafd656a732db46decbed89389cf6207b168dda6f925d60c590';
const tokenA = 'tNULSeBaMy1Rk3KaHcvXYTGNoNpr8ckAzkKWfS';
const tokenB = 'tNULSeBaN8Ps39De43Gik5GfQ6h4GYsHGmwNcP';

const wAssetFactory = 'tNULSeBaNCULzexmzet8TbRu6uFnzZarwAX4yb';
const wAssetCodeHash = '8ecce50a65f33c0c8d7ae30d4f7c0b04608ac9825a1db7f1eb6cb7e204e3776f';

function calcDeployedAddress(chainId, sender, salt, codeHash) {
    const saltBuf = Buffer.from(nuls.programEncodePacked(salt), 'hex');
    const createData = nuls.programCreateDataEncodePacked(nuls.getBytesAddress(sender), saltBuf, Buffer.from(codeHash, 'hex'));
    const hash160 = nuls.sha256ripemd160(keccak('keccak256').update(Buffer.from(createData, 'hex')).digest());
    const chainIdBuffer = Buffer.concat([Buffer.from([0xFF & chainId >> 0]), Buffer.from([0xFF & chainId >> 8])]);
    const addrBuffer = Buffer.concat([chainIdBuffer, Buffer.from([2]), hash160]);
    return nuls.getStringAddressByBytes(addrBuffer);
}

function calcPairAddress(chainId, _tokenA, _tokenB) {

    // TokenA cannot be equal to TokenB
    if (_tokenA == _tokenB) {
        throw "IDENTICAL_ADDRESSES";
    }
    // Find the correct order of the tokens
    let token0;
    let token1;
    if (nuls.hashCode(tokenA) < nuls.hashCode(tokenB)) {
        token0 = _tokenA;
        token1 = _tokenB;
    } else {
        token0 = _tokenB;
        token1 = _tokenA;
    } 
    return calcDeployedAddress(chainId, factory, ['pair', token0, token1], pairCodeHash);
}

function calcWAssetAddress(chainId, assetChainId, assetId) {
    return calcDeployedAddress(chainId, wAssetFactory, ['wasset', 'w' + assetChainId, 'w' + assetId], wAssetCodeHash)
}

console.log(calcPairAddress(2, tokenA, tokenB));
console.log(calcWAssetAddress(2, 5, 1));
console.log(calcWAssetAddress(2, 5, 74));