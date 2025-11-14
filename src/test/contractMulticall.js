const {invokeView} = require('./api/util');
const nuls = require('../index');

const MULTICALL_ADDRESS = {
  1: 'NULSd6Hgrnv1oxcdyhzZmsu7HWgk7vcaR6nMR',
  2: 'tNULSeBaMwP81fGuNPRRSpKxLto1o1hQPnUTJQ',
  101: 'ITACdAD3GBNJnzWof9H51W4Vy6DaNZVBqZ8V1E'
};

function normalizeArgs(argEntry) {
  if (Array.isArray(argEntry)) {
    return argEntry;
  }
  if (argEntry === '' || argEntry === undefined || argEntry === null) {
    return [];
  }
  return [argEntry];
}

async function callSingleView(contractAddress, methodName, argsEntry) {
  const args = normalizeArgs(argsEntry);
  const response = await invokeView(contractAddress, methodName, '', args);
  if (!response.success) {
    throw 'invokeView failed: ' + JSON.stringify(response);
  }
  if (response.data && response.data.result !== undefined) {
    return response.data.result;
  }
  if (response.data !== undefined) {
    return response.data;
  }
  return null;
}

async function aggregateSequential(contractAddressArray, methodNameArray, argsArray) {
  const results = [];
  for (let i = 0; i < contractAddressArray.length; i++) {
    const contractAddress = contractAddressArray[i];
    const methodName = methodNameArray[i];
    const argEntry = Array.isArray(argsArray) ? argsArray[i] : [];
    const value = await callSingleView(contractAddress, methodName, argEntry);
    results.push(value);
  }
  return { result: JSON.stringify(results) };
}

async function aggregateViaContract(multicallAddress, contractAddressArray, methodNameArray, argsArray) {
  const result = await invokeView(
    multicallAddress,
    'aggregateStrict',
    '',
    [contractAddressArray, methodNameArray, argsArray, false]
  );
  if (!result.success) {
    throw 'multicall: ' + JSON.stringify(result);
  }
  return result.data;
}

module.exports = {

  /**
   * 预估调用合约的gas
   * @param chainId
   * @param sender
   * @param value
   * @param contractAddress
   * @param methodName
   * @param methodDesc
   * @param args
   * @returns {Promise<*>}
   */
  async multicall(contractAddressArray, methodNameArray, argsArray) {
    const chainId = nuls.chainId();
    const contractAddress = MULTICALL_ADDRESS[chainId];
    if (contractAddress) {
      try {
        return await aggregateViaContract(contractAddress, contractAddressArray, methodNameArray, argsArray);
      } catch (error) {
        console.warn('multicall aggregateStrict failed, fallback to sequential.', error);
      }
    }
    return await aggregateSequential(contractAddressArray, methodNameArray, argsArray);
  }

}
