"use strict";

module.exports = {
  stringToByte: function stringToByte(str) {
    var bytes = [];
    var len = void 0,
        c = void 0;
    len = str.length;
    for (var i = 0; i < len; i++) {
      c = str.charCodeAt(i);
      if (c >= 0x010000 && c <= 0x10FFFF) {
        bytes.push(c >> 18 & 0x07 | 0xF0);
        bytes.push(c >> 12 & 0x3F | 0x80);
        bytes.push(c >> 6 & 0x3F | 0x80);
        bytes.push(c & 0x3F | 0x80);
      } else if (c >= 0x000800 && c <= 0x00FFFF) {
        bytes.push(c >> 12 & 0x0F | 0xE0);
        bytes.push(c >> 6 & 0x3F | 0x80);
        bytes.push(c & 0x3F | 0x80);
      } else if (c >= 0x000080 && c <= 0x0007FF) {
        bytes.push(c >> 6 & 0x1F | 0xC0);
        bytes.push(c & 0x3F | 0x80);
      } else {
        bytes.push(c & 0xFF);
      }
    }
    return bytes;
  }
};