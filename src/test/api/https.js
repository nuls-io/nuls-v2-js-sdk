const axios = require('axios');
const API_CHAIN_ID = 1;
axios.defaults.timeout = 8000;
// axios.defaults.baseURL = 'http://127.0.0.1:18004/api';
// axios.defaults.baseURL = 'http://localhost:18003/';
axios.defaults.baseURL = 'https://public1.nuls.io/';
// axios.defaults.baseURL = 'https://beta.api.nuls.io/jsonrpc';
// axios.defaults.baseURL = 'http://127.0.0.1:18004/jsonrpc';
axios.defaults.headers.post['Content-Type'] = 'application/json';

/**
 * 封装post请求
 * Encapsulation post method
 * @param url
 * @param methodName
 * @param data
 * @returns {Promise}
 */
module.exports = {
  post(url, methodName, data = []) {
    return new Promise((resolve, reject) => {
      data.unshift(API_CHAIN_ID);
      const params = {"jsonrpc": "2.0", "method": methodName, "params": data, "id": 5898};
      axios.post(url, params)
        .then(response => {
          resolve(response.data)
        }, err => {
          reject(err)
        })
    })
  },

  postComplete(url, methodName, data = []) {
    return new Promise((resolve, reject) => {
      const params = {"jsonrpc": "2.0", "method": methodName, "params": data, "id": 5899};
      axios.post(url, params)
          .then(response => {
            resolve(response.data)
          }, err => {
            reject(err)
          })
    })
  }
};
