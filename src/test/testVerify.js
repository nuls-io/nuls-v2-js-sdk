const sdk = require("../api/sdk");

function dataToHex(data) {
	try {
		let _data = Buffer.from(data, "hex").toString("hex");
		let isHex = _data != '' && _data === data;
		if (isHex) {
			return data;
		}
		return Buffer.from(data, "utf8").toString("hex");
	} catch (e) {
		return Buffer.from(data, "utf8").toString("hex");
	}
}

let data = 'Nonce: 87472423';
let signHex = '304502200c56fbf1608783a09f810d9e926b14c85b581846ef0e38b3d225bc33bfdd5d64022100d91d47dd0ae4be26cf02d832f654779492242b86ce8101477b43ec653a92ddcd';
let pubHex = '02b0531fe5e0a9dedd6d168ec6de8973e478c5e038314a87ea9058cdf331bf923f';
console.log(sdk.verifySign(dataToHex(data), signHex, pubHex));