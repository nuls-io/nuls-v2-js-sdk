
const nuls = require("../../index");
const keccak = require('keccak');

const factoryBuf = nuls.getBytesAddress('tNULSeBaMyduuqjrF9DkXN3hXUbpR6azkqkQJA');
const pairCodeHashBuf = Buffer.from('5af944402b2c9926408fbe6dda6fd097bef299b553a4190e32300714b6733fce', 'hex');
const tokenA = 'tNULSeBaMy1Rk3KaHcvXYTGNoNpr8ckAzkKWfS';
const tokenB = 'tNULSeBaN8Ps39De43Gik5GfQ6h4GYsHGmwNcP';

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
    const saltBuf = Buffer.from(nuls.programEncodePacked(['pair', token0, token1]), 'hex');
    const createData = nuls.programCreateDataEncodePacked(factoryBuf, saltBuf, pairCodeHashBuf);
    const hash160 = nuls.sha256ripemd160(keccak('keccak256').update(Buffer.from(createData, 'hex')).digest());
    const chainIdBuffer = Buffer.concat([Buffer.from([0xFF & chainId >> 0]), Buffer.from([0xFF & chainId >> 8])]);
    const addrBuffer = Buffer.concat([chainIdBuffer, Buffer.from([2]), hash160]);
    return nuls.getStringAddressByBytes(addrBuffer);
}

console.log(calcPairAddress(2, tokenA, tokenB));